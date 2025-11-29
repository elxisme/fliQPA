import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin,
  Shield,
  CreditCard,
  CheckCircle
} from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  city: string;
  profile_base_price: number;
  provider: {
    category: string;
    rating: number;
  };
}

interface Service {
  id: string;
  title: string;
  description: string;
  price_hour?: number;
  price_day?: number;
  price_week?: number;
  min_booking_hours: number;
}

const BookingFlow = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    duration: '',
    durationType: 'hours', // hours, days, weeks
    location: '',
    notes: '',
    paymentMethod: 'wallet'
  });

  const [costs, setCosts] = useState({
    baseAmount: 0,
    platformFee: 0,
    totalAmount: 0
  });

  useEffect(() => {
    if (providerId) {
      fetchProviderAndService();
    }
  }, [providerId, serviceId]);

  useEffect(() => {
    calculateCosts();
  }, [bookingData, service, provider]);

  const fetchProviderAndService = async () => {
    try {
      // Fetch provider
      const { data: providerData, error: providerError } = await supabase
        .from('users')
        .select(`
          *,
          providers (
            category,
            rating
          )
        `)
        .eq('id', providerId)
        .eq('role', 'provider')
        .single();

      if (providerError) throw providerError;

      setProvider({
        ...providerData,
        provider: providerData.providers?.[0] || {}
      });

      // Fetch specific service if serviceId provided
      if (serviceId) {
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('*')
          .eq('id', serviceId)
          .single();

        if (serviceError) throw serviceError;
        setService(serviceData);
      }
    } catch (error) {
      console.error('Error fetching provider/service:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCosts = () => {
    if (!bookingData.duration || !provider) return;

    const duration = parseInt(bookingData.duration);
    if (isNaN(duration) || duration <= 0) return;

    let baseAmount = 0;
    
    if (service) {
      // Use service pricing
      switch (bookingData.durationType) {
        case 'hours':
          baseAmount = (service.price_hour || 0) * duration;
          break;
        case 'days':
          baseAmount = (service.price_day || 0) * duration;
          break;
        case 'weeks':
          baseAmount = (service.price_week || 0) * duration;
          break;
      }
    } else {
      // Use provider base pricing (hourly)
      baseAmount = provider.profile_base_price * duration;
    }

    const platformFee = Math.round(baseAmount * 0.05); // 5% platform fee
    const totalAmount = baseAmount + platformFee;

    setCosts({
      baseAmount,
      platformFee,
      totalAmount
    });
  };

  const handleSubmitBooking = async () => {
    if (!user || !provider) return;

    setSubmitting(true);
    try {
      const startDateTime = new Date(`${bookingData.date}T${bookingData.startTime}`);
      const endDateTime = new Date(startDateTime);
      
      // Calculate end time based on duration type
      switch (bookingData.durationType) {
        case 'hours':
          endDateTime.setHours(endDateTime.getHours() + parseInt(bookingData.duration));
          break;
        case 'days':
          endDateTime.setDate(endDateTime.getDate() + parseInt(bookingData.duration));
          break;
        case 'weeks':
          endDateTime.setDate(endDateTime.getDate() + (parseInt(bookingData.duration) * 7));
          break;
      }

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert([{
          client_id: user.id,
          provider_id: providerId,
          service_id: serviceId,
          category: provider.provider.category,
          status: 'REQUESTED',
          requested_start: startDateTime.toISOString(),
          requested_end: endDateTime.toISOString(),
          estimated_amount: costs.totalAmount,
          platform_fee: costs.platformFee,
          provider_payout: costs.baseAmount
        }])
        .select()
        .single();

      if (error) throw error;

      // Move to success step
      setStep(4);
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Provider not found</h2>
          <Button onClick={() => navigate('/client/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900">Select Date & Time</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              
              <Input
                label="Start Time"
                type="time"
                value={bookingData.startTime}
                onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Duration"
                type="number"
                value={bookingData.duration}
                onChange={(e) => setBookingData({...bookingData, duration: e.target.value})}
                min={service?.min_booking_hours || 1}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Duration Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={bookingData.durationType}
                  onChange={(e) => setBookingData({...bookingData, durationType: e.target.value})}
                >
                  <option value="hours">Hours</option>
                  {(service?.price_day || !service) && <option value="days">Days</option>}
                  {(service?.price_week || !service) && <option value="weeks">Weeks</option>}
                </select>
              </div>
            </div>

            <Input
              label="Location"
              value={bookingData.location}
              onChange={(e) => setBookingData({...bookingData, location: e.target.value})}
              placeholder="Where should the service be provided?"
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                value={bookingData.notes}
                onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                placeholder="Any special requirements or instructions..."
              />
            </div>

            <Button 
              onClick={() => setStep(2)}
              disabled={!bookingData.date || !bookingData.startTime || !bookingData.duration || !bookingData.location}
              className="w-full"
            >
              Continue to Review
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900">Review Booking</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Service</span>
                <span className="font-medium">{service?.title || 'General Service'}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Date & Time</span>
                <span className="font-medium">
                  {new Date(`${bookingData.date}T${bookingData.startTime}`).toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Duration</span>
                <span className="font-medium">
                  {bookingData.duration} {bookingData.durationType}
                </span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Location</span>
                <span className="font-medium">{bookingData.location}</span>
              </div>

              {bookingData.notes && (
                <div className="flex justify-between py-2">
                  <span className="text-slate-600">Notes</span>
                  <span className="font-medium">{bookingData.notes}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Base Amount</span>
                <span>₦{costs.baseAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Platform Fee</span>
                <span>₦{costs.platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total Amount</span>
                <span>₦{costs.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Continue to Payment
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900">Payment</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Secure Payment</h3>
              <p className="text-sm text-blue-800">
                Your payment will be held in escrow until the provider accepts your booking. 
                If declined, funds will be automatically refunded to your wallet.
              </p>
            </div>

            <div className="space-y-3">
              <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                bookingData.paymentMethod === 'wallet' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
              }`} onClick={() => setBookingData({...bookingData, paymentMethod: 'wallet'})}>
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      bookingData.paymentMethod === 'wallet' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                    }`}>
                      {bookingData.paymentMethod === 'wallet' && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Wallet Balance</div>
                    <div className="text-sm text-slate-600">Current balance: ₦0</div>
                  </div>
                </div>
              </div>

              <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                bookingData.paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
              }`} onClick={() => setBookingData({...bookingData, paymentMethod: 'card'})}>
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      bookingData.paymentMethod === 'card' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                    }`}>
                      {bookingData.paymentMethod === 'card' && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Credit/Debit Card</div>
                    <div className="text-sm text-slate-600">Pay with Paystack</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total to Pay</span>
                <span>₦{costs.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleSubmitBooking}
                loading={submitting}
                className="flex-1"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Confirm & Pay
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Booking Submitted!</h2>
              <p className="text-slate-600">
                Your booking request has been sent to {provider.name}. 
                You'll be notified once they respond.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• {provider.name} will be notified of your request</li>
                <li>• They have 24 hours to accept or decline</li>
                <li>• You'll receive real-time updates on your booking status</li>
                <li>• Payment is held securely until service completion</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/client/dashboard')}
                className="flex-1"
              >
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => navigate(`/booking/track/${provider.id}`)}
                className="flex-1"
              >
                Track Booking
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/provider/${providerId}`)}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-2xl font-bold text-blue-600">fliQ</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Provider Summary */}
        <Card className="p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {provider.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{provider.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {provider.city}
                </span>
                <Badge variant="info" size="sm" className="capitalize">
                  {provider.provider.category}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {i}
              </div>
              {i < 4 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  i < step ? 'bg-blue-600' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="p-8">
          {renderStep()}
        </Card>
      </div>
    </div>
  );
};

export default BookingFlow;