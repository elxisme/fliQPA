import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreateSubaccountRequest {
  provider_id: string;
  business_name: string;
  settlement_bank: string;
  account_number: string;
  percentage_charge: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const {
      provider_id,
      business_name,
      settlement_bank,
      account_number,
      percentage_charge = 20,
    }: CreateSubaccountRequest = await req.json();

    if (!provider_id || !business_name || !settlement_bank || !account_number) {
      throw new Error('Missing required fields');
    }

    const { data: providerData, error: providerError } = await supabaseClient
      .from('providers')
      .select('user_id, paystack_subaccount_code')
      .eq('id', provider_id)
      .maybeSingle();

    if (providerError) {
      throw providerError;
    }

    if (!providerData) {
      throw new Error('Provider not found');
    }

    if (providerData.user_id !== user.id) {
      throw new Error('Unauthorized - not your provider account');
    }

    if (providerData.paystack_subaccount_code) {
      const updateResponse = await fetch(
        `https://api.paystack.co/subaccount/${providerData.paystack_subaccount_code}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            business_name,
            settlement_bank,
            account_number,
            percentage_charge,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || 'Failed to update subaccount');
      }

      const updateData = await updateResponse.json();

      return new Response(
        JSON.stringify({
          status: true,
          data: updateData.data,
          message: 'Subaccount updated successfully'
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const createResponse = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name,
        settlement_bank,
        account_number,
        percentage_charge,
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(errorData.message || 'Failed to create subaccount');
    }

    const createData = await createResponse.json();

    const { error: updateError } = await supabaseClient
      .from('providers')
      .update({
        paystack_subaccount_code: createData.data.subaccount_code,
      })
      .eq('id', provider_id);

    if (updateError) {
      console.error('Failed to save subaccount code:', updateError);
    }

    return new Response(
      JSON.stringify({
        status: true,
        data: createData.data,
        message: 'Subaccount created successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error with subaccount:', error);
    return new Response(
      JSON.stringify({
        status: false,
        message: error instanceof Error ? error.message : 'Failed to process subaccount'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});