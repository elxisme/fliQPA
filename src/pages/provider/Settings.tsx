import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { AvatarUpload } from '../../components/provider/AvatarUpload';
import { supabase } from '../../lib/supabase';
import {
  ArrowLeft,
  Settings,
  LogOut,
  Menu,
  User,
  MapPin,
  Bell,
  CreditCard,
  Shield,
  Camera,
  Save,
  AlertTriangle,
  Pause,
  Trash2,
  Power,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Bank {
  id: number;
  name: string;
  code: string;
}

interface AccountVerification {
  status: boolean;
  account_name: string;
}

interface ProviderData {
  id: string;
  category: string;
  bio: string;
  rating: number;
  is_online: boolean;
  vacation_mode: boolean;
  show_distance_to_clients: boolean;
  show_ratings: boolean;
  account_status: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  bank_verified: boolean;
}

interface AccountManagement {
  status: string;
  pause_reason?: string;
  paused_at?: string;
  deactivation_reason?: string;
  deactivated_at?: string;
}

const ProviderSettings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accountVerification, setAccountVerification] = useState<AccountVerification | null>(null);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [creatingSubaccount, setCreatingSubaccount] = useState(false);
  const [hasActiveJobs, setHasActiveJobs] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    city: '',
    gender: '',
    avatar_url: ''
  });

  const [providerData, setProviderData] = useState<ProviderData>({
    id: '',
    category: '',
    bio: '',
    rating: 0,
    is_online: true,
    vacation_mode: false,
    show_distance_to_clients: true,
    show_ratings: true,
    account_status: 'active',
    bank_verified: false
  });

  const [locationSettings, setLocationSettings] = useState({
    gps_tracking_enabled: false,
    service_radius_km: 5
  });

  const [notificationSettings, setNotificationSettings] = useState({
    booking_requests: true,
    new_messages: true,
    payment_received: true,
    system_updates: true,
    dispute_alerts: true
  });

  const [bankSettings, setBankSettings] = useState({
    bank_name: '',
    bank_code: '',
    account_number: '',
    account_name: ''
  });

  const [accountManagement, setAccountManagement] = useState<AccountManagement>({
    status: 'active'
  });

  const [pauseReason, setPauseReason] = useState('');
  const [deactivationReason, setDeactivationReason] = useState('');

  useEffect(() => {
    if (user?.role !== 'provider') {
      navigate('/');
      return;
    }
    if (!user.hasCompletedOnboarding) {
      navigate('/provider/onboarding');
      return;
    }
    fetchAllData();
  }, [user, navigate]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchUserProfile(),
        fetchProviderData(),
        fetchLocationSettings(),
        fetchNotificationSettings(),
        fetchBanks(),
        fetchAccountManagement(),
        checkActiveJobs()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user?.id)
      .single();

    if (error) throw error;

    setProfileData({
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      city: data.city || '',
      gender: data.gender || '',
      avatar_url: data.avatar_url || ''
    });
  };

  const fetchProviderData = async () => {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (error) throw error;

    setProviderData(data);
    setBankSettings({
      bank_name: data.bank_name || '',
      bank_code: '',
      account_number: data.account_number || '',
      account_name: data.account_name || ''
    });
  };

  const fetchLocationSettings = async () => {
    const { data: providerData } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (providerData?.id) {
      const { data, error } = await supabase
        .from('provider_location_settings')
        .select('*')
        .eq('provider_id', providerData.id)
        .maybeSingle();

      if (!error && data) {
        setLocationSettings({
          gps_tracking_enabled: data.gps_tracking_enabled,
          service_radius_km: data.service_radius_km
        });
      }
    }
  };

  const fetchNotificationSettings = async () => {
    const { data: providerData } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (providerData?.id) {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('provider_id', providerData.id)
        .maybeSingle();

      if (!error && data) {
        setNotificationSettings({
          booking_requests: data.booking_requests,
          new_messages: data.new_messages,
          payment_received: data.payment_received,
          system_updates: data.system_updates,
          dispute_alerts: data.dispute_alerts
        });
      }
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paystack-banks`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status) {
          setBanks(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };

  const fetchAccountManagement = async () => {
    const { data: providerData } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (providerData?.id) {
      const { data, error } = await supabase
        .from('account_management')
        .select('*')
        .eq('provider_id', providerData.id)
        .maybeSingle();

      if (!error && data) {
        setAccountManagement(data);
      }
    }
  };

  const checkActiveJobs = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('provider_id', user?.id)
      .in('status', ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_SERVICE'])
      .limit(1);

    if (!error) {
      setHasActiveJobs((data?.length || 0) > 0);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          phone: profileData.phone,
          city: profileData.city,
          gender: profileData.gender || null
        })
        .eq('id', user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProviderSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('providers')
        .update({
          bio: providerData.bio,
          is_online: providerData.is_online,
          vacation_mode: providerData.vacation_mode,
          show_distance_to_clients: providerData.show_distance_to_clients,
          show_ratings: providerData.show_ratings
        })
        .eq('user_id', user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving provider settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!bankSettings.account_number || !bankSettings.bank_code) return;

    setVerifyingAccount(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paystack-verify-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: bankSettings.account_number,
          bank_code: bankSettings.bank_code
        }),
      });

      const result = await response.json();

      if (result.status) {
        setAccountVerification({
          status: true,
          account_name: result.data.account_name
        });
        setBankSettings(prev => ({
          ...prev,
          account_name: result.data.account_name
        }));
      } else {
        throw new Error(result.message || 'Account verification failed');
      }
    } catch (error) {
      console.error('Error verifying account:', error);
      setAccountVerification({
        status: false,
        account_name: ''
      });
    } finally {
      setVerifyingAccount(false);
    }
  };

  const handleCreateSubaccount = async () => {
    if (!accountVerification?.status || !providerData.id) return;

    setCreatingSubaccount(true);
    try {
      const selectedBank = banks.find(bank => bank.code === bankSettings.bank_code);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paystack-create-subaccount`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider_id: providerData.id,
          business_name: `${profileData.name} - ${providerData.category}`,
          settlement_bank: bankSettings.bank_code,
          account_number: bankSettings.account_number,
          percentage_charge: 20
        }),
      });

      const result = await response.json();

      if (result.status) {
        const { error } = await supabase
          .from('providers')
          .update({
            bank_name: selectedBank?.name,
            account_number: bankSettings.account_number,
            account_name: bankSettings.account_name,
            bank_verified: true,
            bank_verified_at: new Date().toISOString()
          })
          .eq('id', providerData.id);

        if (error) throw error;

        setProviderData(prev => ({
          ...prev,
          bank_name: selectedBank?.name || '',
          account_number: bankSettings.account_number,
          account_name: bankSettings.account_name,
          bank_verified: true
        }));
      } else {
        throw new Error(result.message || 'Failed to create subaccount');
      }
    } catch (error) {
      console.error('Error creating subaccount:', error);
    } finally {
      setCreatingSubaccount(false);
    }
  };

  const handlePauseAccount = async () => {
    if (!pauseReason.trim()) return;

    setSaving(true);
    try {
      const { data: providerData } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (providerData?.id) {
        const { error } = await supabase
          .from('account_management')
          .upsert({
            provider_id: providerData.id,
            status: 'paused',
            pause_reason: pauseReason,
            paused_at: new Date().toISOString()
          });

        if (error) throw error;

        setAccountManagement({
          status: 'paused',
          pause_reason: pauseReason,
          paused_at: new Date().toISOString()
        });
        setPauseReason('');
      }
    } catch (error) {
      console.error('Error pausing account:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReactivateAccount = async () => {
    setSaving(true);
    try {
      const { data: providerData } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (providerData?.id) {
        const { error } = await supabase
          .from('account_management')
          .upsert({
            provider_id: providerData.id,
            status: 'active',
            pause_reason: null,
            paused_at: null
          });

        if (error) throw error;

        setAccountManagement({
          status: 'active'
        });
      }
    } catch (error) {
      console.error('Error reactivating account:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!deactivationReason.trim()) return;

    setSaving(true);
    try {
      const { data: providerData } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (providerData?.id) {
        const { error } = await supabase
          .from('account_management')
          .upsert({
            provider_id: providerData.id,
            status: 'deactivated',
            deactivation_reason: deactivationReason,
            deactivated_at: new Date().toISOString()
          });

        if (error) throw error;

        setAccountManagement({
          status: 'deactivated',
          deactivation_reason: deactivationReason,
          deactivated_at: new Date().toISOString()
        });
        setDeactivationReason('');
      }
    } catch (error) {
      console.error('Error deactivating account:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') return;

    setSaving(true);
    try {
      const { data: providerData } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (providerData?.id) {
        const { error } = await supabase
          .from('account_management')
          .upsert({
            provider_id: providerData.id,
            status: 'deleted',
            deleted_at: new Date().toISOString()
          });

        if (error) throw error;

        // Sign out and redirect
        await signOut();
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderAccountManagement = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Account Status</h3>
        <div className="flex items-center space-x-3 mb-4">
          <Badge 
            variant={
              accountManagement.status === 'active' ? 'success' :
              accountManagement.status === 'paused' ? 'warning' :
              accountManagement.status === 'deactivated' ? 'danger' : 'neutral'
            }
            className="capitalize"
          >
            {accountManagement.status}
          </Badge>
          {accountManagement.status === 'paused' && accountManagement.pause_reason && (
            <span className="text-sm text-slate-600">
              Reason: {accountManagement.pause_reason}
            </span>
          )}
        </div>
      </div>

      {accountManagement.status === 'active' && (
        <div className="space-y-6">
          {/* Pause Account */}
          <Card className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Pause className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-slate-900 mb-2">
                  Pause Account Temporarily
                </h4>
                <p className="text-slate-600 mb-4">
                  Temporarily pause your account to stop receiving new bookings. 
                  You can reactivate anytime.
                </p>
                <div className="space-y-3">
                  <Input
                    placeholder="Reason for pausing (optional)"
                    value={pauseReason}
                    onChange={(e) => setPauseReason(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={handlePauseAccount}
                    loading={saving}
                    className="flex items-center"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Account
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Deactivate Account */}
          <Card className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Power className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-slate-900 mb-2">
                  Deactivate Account
                </h4>
                <p className="text-slate-600 mb-4">
                  Deactivate your provider account. This will hide your profile from clients 
                  and stop all bookings. Contact support to reactivate.
                </p>
                <div className="space-y-3">
                  <Input
                    placeholder="Reason for deactivation (required)"
                    value={deactivationReason}
                    onChange={(e) => setDeactivationReason(e.target.value)}
                    required
                  />
                  <Button
                    variant="danger"
                    onClick={handleDeactivateAccount}
                    loading={saving}
                    disabled={!deactivationReason.trim()}
                    className="flex items-center"
                  >
                    <Power className="w-4 h-4 mr-2" />
                    Deactivate Account
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {accountManagement.status === 'paused' && (
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">
                Reactivate Account
              </h4>
              <p className="text-slate-600 mb-4">
                Your account is currently paused. Reactivate to start receiving bookings again.
              </p>
              <Button
                onClick={handleReactivateAccount}
                loading={saving}
                className="flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Reactivate Account
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Danger Zone - Delete Account */}
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-red-900 mb-2">
              Danger Zone
            </h4>
            <p className="text-red-700 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            
            {hasActiveJobs ? (
              <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-medium">
                    Cannot delete account with active bookings
                  </span>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  Complete or cancel all active bookings before deleting your account.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {!showDeleteConfirm ? (
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account Permanently
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 font-medium mb-2">
                        Are you absolutely sure?
                      </p>
                      <p className="text-red-700 text-sm mb-3">
                        Type "DELETE MY ACCOUNT" to confirm permanent deletion.
                      </p>
                      <Input
                        placeholder="DELETE MY ACCOUNT"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="mb-3"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        onClick={handleDeleteAccount}
                        loading={saving}
                        disabled={deleteConfirmText !== 'DELETE MY ACCOUNT'}
                        className="flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account Permanently
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/provider/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="text-2xl font-bold text-blue-600">fliQ</div>
              <Badge variant="info" className="ml-3">Provider</Badge>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={handleLogout} className="flex items-center">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-2">
            <div className="space-y-2">
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-2">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {[
                { id: 'profile', name: 'Profile', icon: User },
                { id: 'provider', name: 'Provider Settings', icon: Settings },
                { id: 'location', name: 'Location & Privacy', icon: MapPin },
                { id: 'notifications', name: 'Notifications', icon: Bell },
                { id: 'payments', name: 'Bank & Payments', icon: CreditCard },
                { id: 'account', name: 'Account Management', icon: Shield }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'account' && renderAccountManagement()}
          
          {/* Other tab content would go here */}
          {activeTab !== 'account' && (
            <Card className="p-8 text-center">
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {activeTab === 'profile' && 'Profile Settings'}
                {activeTab === 'provider' && 'Provider Settings'}
                {activeTab === 'location' && 'Location & Privacy Settings'}
                {activeTab === 'notifications' && 'Notification Settings'}
                {activeTab === 'payments' && 'Bank & Payment Settings'}
              </h3>
              <p className="text-slate-600">
                This section is under development. Please check back later.
              </p>
            </Card>
          )}
        </div>
      </div>

      {showAvatarUpload && (
        <AvatarUpload
          currentAvatar={profileData.avatar_url}
          onUploadComplete={(imageUrl) => {
            setProfileData(prev => ({ ...prev, avatar_url: imageUrl }));
            setShowAvatarUpload(false);
          }}
          onCancel={() => setShowAvatarUpload(false)}
        />
      )}
    </div>
  );
};

export default ProviderSettings;