import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import {
  ArrowLeft,
  User,
  Package,
  Calendar,
  CreditCard,
  Shield,
  Bell,
  Lock,
  MapPin,
  Eye,
  Settings as SettingsIcon,
  HelpCircle,
  ChevronRight,
  X,
  Check,
  DollarSign,
  Clock,
  LogOut
} from 'lucide-react';
import { AvatarUpload } from '../../components/provider/AvatarUpload';
import { Input } from '../../components/ui/Input';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
}

const sections: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Profile Information',
    description: 'Manage your personal details and profile',
    icon: User,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'services',
    title: 'Service Information',
    description: 'Primary category and base pricing',
    icon: Package,
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'availability',
    title: 'Availability & Schedule',
    description: 'Set your working hours and availability',
    icon: Calendar,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 'payment',
    title: 'Bank & Payment Settings',
    description: 'Manage your payout account details',
    icon: CreditCard,
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    id: 'verification',
    title: 'Verification & Compliance',
    description: 'Upload verification documents',
    icon: Shield,
    color: 'bg-red-100 text-red-600'
  },
  {
    id: 'location',
    title: 'Location Settings',
    description: 'GPS tracking and service radius',
    icon: MapPin,
    color: 'bg-cyan-100 text-cyan-600'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Manage your notification preferences',
    icon: Bell,
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'privacy',
    title: 'Privacy Settings',
    description: 'Profile visibility, security & password',
    icon: Eye,
    color: 'bg-pink-100 text-pink-600'
  },
  {
    id: 'account',
    title: 'Account Management',
    description: 'Pause, deactivate, or delete account',
    icon: SettingsIcon,
    color: 'bg-gray-100 text-gray-600'
  },
  {
    id: 'support',
    title: 'Support & Help',
    description: 'FAQs, contact support, and guidelines',
    icon: HelpCircle,
    color: 'bg-teal-100 text-teal-600'
  }
];

const ProviderSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (user?.role !== 'provider') {
      navigate('/');
      return;
    }
    if (!user.hasCompletedOnboarding) {
      navigate('/provider/onboarding');
      return;
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [user, navigate]);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleCloseModal = () => {
    setActiveSection(null);
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'profile':
        return <ProfileSettings onClose={handleCloseModal} />;
      case 'services':
        return <ServiceSettings onClose={handleCloseModal} />;
      case 'availability':
        return <AvailabilitySettings onClose={handleCloseModal} />;
      case 'payment':
        return <PaymentSettings onClose={handleCloseModal} />;
      case 'verification':
        return <VerificationSettings onClose={handleCloseModal} />;
      case 'location':
        return <LocationSettings onClose={handleCloseModal} />;
      case 'notifications':
        return <NotificationSettings onClose={handleCloseModal} />;
      case 'privacy':
        return <PrivacySettings onClose={handleCloseModal} />;
      case 'account':
        return <AccountSettings onClose={handleCloseModal} />;
      case 'support':
        return <SupportSettings onClose={handleCloseModal} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/provider/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-2xl font-bold text-blue-600">fliQ</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-2">Manage your account and preferences</p>
        </div>

        {!isMobile ? (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      activeSection === section.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${section.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="font-semibold text-slate-900 text-sm">{section.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="col-span-8">
              {!activeSection ? (
                <Card className="p-12 text-center">
                  <SettingsIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Select a Setting
                  </h3>
                  <p className="text-slate-600">
                    Choose an option from the menu to manage your settings
                  </p>
                </Card>
              ) : (
                <Card className="p-0 overflow-hidden">
                  {renderSectionContent(activeSection)}
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Card
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className="p-4 cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${section.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-slate-900">{section.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{section.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {activeSection && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-xl max-h-[90vh] overflow-y-auto">
            {renderSectionContent(activeSection)}
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    bio: '',
    gender: '',
    avatarUrl: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, phone, city, avatar_url, gender')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('bio')
        .eq('user_id', user.id)
        .maybeSingle();

      if (providerError && providerError.code !== 'PGRST116') {
        throw providerError;
      }

      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        city: userData.city || '',
        bio: providerData?.bio || '',
        gender: userData.gender || '',
        avatarUrl: userData.avatar_url || ''
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (avatarDataUrl: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      const base64Data = avatarDataUrl.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const fileName = `${user.id}/avatar_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let avatarPublicUrl = formData.avatarUrl;

      if (formData.avatarUrl && formData.avatarUrl.startsWith('data:')) {
        const uploadedUrl = await uploadAvatar(formData.avatarUrl);
        if (uploadedUrl) {
          avatarPublicUrl = uploadedUrl;
        }
      }

      const { error: userError } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          avatar_url: avatarPublicUrl
        })
        .eq('id', user.id);

      if (userError) throw userError;

      const { data: providerData, error: providerCheckError } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (providerCheckError && providerCheckError.code !== 'PGRST116') {
        throw providerCheckError;
      }

      if (providerData?.id) {
        const { error: providerError } = await supabase
          .from('providers')
          .update({ bio: formData.bio })
          .eq('user_id', user.id);

        if (providerError) throw providerError;
      }

      setSuccess('Profile updated successfully');

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Profile Information</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Profile Information</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center">
            <Check className="w-4 h-4 mr-2" />
            {success}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Profile Photo
          </label>
          {formData.avatarUrl ? (
            <div className="flex items-center space-x-4">
              <img
                src={formData.avatarUrl}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
              />
              <div>
                <p className="text-sm text-slate-600 mb-2">Current profile photo</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAvatarUpload(true)}
                >
                  <User className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAvatarUpload(true)}
              className="w-full border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors"
            >
              <User className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 mb-1">Upload Profile Picture</p>
              <p className="text-sm text-slate-500">PNG or JPG</p>
            </button>
          )}
        </div>

        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Enter your full name"
          required
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 mt-1">
            Email cannot be changed as it is linked to your authentication
          </p>
        </div>

        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          placeholder="Enter your phone number"
          required
        />

        <Input
          label="City / Location"
          value={formData.city}
          onChange={(e) => setFormData({...formData, city: e.target.value})}
          placeholder="Enter your city"
          required
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Bio / About Me
          </label>
          <textarea
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            placeholder="Tell clients about your experience and expertise..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Gender
          </label>
          <select
            value={formData.gender}
            disabled
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
          >
            <option value="">Not specified</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">
            Gender is set during registration and cannot be changed
          </p>
        </div>

        <div className="flex space-x-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>
      </div>

      {showAvatarUpload && (
        <AvatarUpload
          currentAvatar={formData.avatarUrl}
          onUploadComplete={(imageUrl) => {
            setFormData({...formData, avatarUrl: imageUrl});
            setShowAvatarUpload(false);
          }}
          onCancel={() => setShowAvatarUpload(false)}
        />
      )}
    </div>
  );
};

const ServiceSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    category: '',
    basePrice: '',
    minBookingHours: '1',
    maxDailyBookings: ''
  });

  useEffect(() => {
    fetchServiceData();
  }, [user]);

  const fetchServiceData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('profile_base_price')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('category, min_booking_hours, max_daily_bookings')
        .eq('user_id', user.id)
        .maybeSingle();

      if (providerError && providerError.code !== 'PGRST116') {
        throw providerError;
      }

      if (providerData) {
        setFormData({
          category: providerData.category || '',
          basePrice: userData.profile_base_price?.toString() || '',
          minBookingHours: providerData.min_booking_hours?.toString() || '1',
          maxDailyBookings: providerData.max_daily_bookings?.toString() || ''
        });
      }
    } catch (err: any) {
      console.error('Error fetching service data:', err);
      setError(err.message || 'Failed to load service data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error: userError } = await supabase
        .from('users')
        .update({
          profile_base_price: parseFloat(formData.basePrice)
        })
        .eq('id', user.id);

      if (userError) throw userError;

      const updateData: any = {
        min_booking_hours: parseInt(formData.minBookingHours)
      };

      if (formData.maxDailyBookings) {
        updateData.max_daily_bookings = parseInt(formData.maxDailyBookings);
      } else {
        updateData.max_daily_bookings = null;
      }

      const { error: providerError } = await supabase
        .from('providers')
        .update(updateData)
        .eq('user_id', user.id);

      if (providerError) throw providerError;

      setSuccess('Service settings updated successfully');

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err: any) {
      console.error('Error saving service settings:', err);
      setError(err.message || 'Failed to update service settings');
    } finally {
      setSaving(false);
    }
  };

  const categoryNames: { [key: string]: string } = {
    companion: 'Professional Companion',
    bouncer: 'Security/Bouncer',
    bodyguard: 'Personal Bodyguard',
    assistant: 'Personal Assistant'
  };

  if (loading) {
    return (
      <div>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Service Information</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Service Information</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center">
            <Check className="w-4 h-4 mr-2" />
            {success}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            About Service Settings
          </h3>
          <p className="text-sm text-blue-800">
            These settings apply to your base service offering. If you have additional specific services,
            they can have their own pricing and minimum booking requirements.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Primary Category
          </label>
          <div className="relative">
            <div className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-medium">
              {categoryNames[formData.category] || formData.category}
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Lock className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Primary category is set during onboarding and cannot be changed. This ensures consistency
            in your service offering. Contact support if you need to change your primary category.
          </p>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Base Pricing</h3>

          <Input
            label="Base Hourly Rate (₦)"
            type="number"
            value={formData.basePrice}
            onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
            placeholder="e.g., 5000"
            min="0"
            step="100"
            required
            helperText="This is your standard rate per hour for your primary service category"
          />

          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start">
              <DollarSign className="w-5 h-5 text-slate-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-slate-600">
                <p className="font-medium text-slate-900 mb-1">When is this rate used?</p>
                <p>
                  If you don't have specific service packages, clients will book you at this base rate.
                  This ensures you always have a fallback pricing structure.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Booking Requirements</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Minimum Booking Hours"
              type="number"
              value={formData.minBookingHours}
              onChange={(e) => setFormData({...formData, minBookingHours: e.target.value})}
              min="1"
              max="24"
              required
              helperText="Minimum hours clients must book"
            />

            <Input
              label="Max Daily Bookings (Optional)"
              type="number"
              value={formData.maxDailyBookings}
              onChange={(e) => setFormData({...formData, maxDailyBookings: e.target.value})}
              min="1"
              max="10"
              placeholder="No limit"
              helperText="Maximum bookings you accept per day"
            />
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-slate-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-slate-600">
                <p className="font-medium text-slate-900 mb-1">About Minimum Booking Hours</p>
                <p className="mb-2">
                  Setting a minimum helps ensure bookings are worth your time. For example, if you set
                  2 hours minimum, clients cannot book you for just 1 hour.
                </p>
                <p className="font-medium text-slate-900 mb-1 mt-3">About Max Daily Bookings</p>
                <p>
                  This prevents overbooking and helps you maintain quality service. Leave empty if you
                  don't want to set a limit.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={!formData.basePrice || !formData.minBookingHours}
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

const AvailabilitySettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    isOnline: true,
    vacationMode: false,
    workingDays: [
      { day: 'monday', enabled: true, start: '09:00', end: '17:00' },
      { day: 'tuesday', enabled: true, start: '09:00', end: '17:00' },
      { day: 'wednesday', enabled: true, start: '09:00', end: '17:00' },
      { day: 'thursday', enabled: true, start: '09:00', end: '17:00' },
      { day: 'friday', enabled: true, start: '09:00', end: '17:00' },
      { day: 'saturday', enabled: false, start: '09:00', end: '17:00' },
      { day: 'sunday', enabled: false, start: '09:00', end: '17:00' }
    ]
  });

  useEffect(() => {
    fetchAvailabilityData();
  }, [user]);

  const fetchAvailabilityData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('is_online, vacation_mode, working_days')
        .eq('user_id', user.id)
        .maybeSingle();

      if (providerError && providerError.code !== 'PGRST116') {
        throw providerError;
      }

      if (providerData) {
        setFormData({
          isOnline: providerData.is_online ?? true,
          vacationMode: providerData.vacation_mode ?? false,
          workingDays: providerData.working_days && Array.isArray(providerData.working_days) && providerData.working_days.length > 0
            ? providerData.working_days
            : formData.workingDays
        });
      }
    } catch (err: any) {
      console.error('Error fetching availability data:', err);
      setError(err.message || 'Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error: providerError } = await supabase
        .from('providers')
        .update({
          is_online: formData.isOnline,
          vacation_mode: formData.vacationMode,
          working_days: formData.workingDays
        })
        .eq('user_id', user.id);

      if (providerError) throw providerError;

      setSuccess('Availability settings updated successfully');

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err: any) {
      console.error('Error saving availability settings:', err);
      setError(err.message || 'Failed to update availability settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayIndex: number) => {
    const newWorkingDays = [...formData.workingDays];
    newWorkingDays[dayIndex].enabled = !newWorkingDays[dayIndex].enabled;
    setFormData({ ...formData, workingDays: newWorkingDays });
  };

  const updateDayTime = (dayIndex: number, field: 'start' | 'end', value: string) => {
    const newWorkingDays = [...formData.workingDays];
    newWorkingDays[dayIndex][field] = value;
    setFormData({ ...formData, workingDays: newWorkingDays });
  };

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) {
    return (
      <div>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Availability & Schedule</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Availability & Schedule</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center">
            <Check className="w-4 h-4 mr-2" />
            {success}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            About Availability Settings
          </h3>
          <p className="text-sm text-blue-800">
            Control when you're available to receive bookings. If you're offline, you won't appear in client searches.
            Vacation mode will completely disable all booking requests.
          </p>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Current Status</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${formData.isOnline ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                <div>
                  <p className="font-medium text-slate-900">
                    {formData.isOnline ? 'Online' : 'Offline'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {formData.isOnline ? 'Available for bookings' : 'Not accepting new bookings'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFormData({ ...formData, isOnline: !formData.isOnline })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isOnline ? 'bg-green-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isOnline ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="font-medium text-slate-900">Vacation Mode</p>
                <p className="text-sm text-slate-600">
                  Completely disable all bookings temporarily
                </p>
              </div>
              <button
                onClick={() => setFormData({ ...formData, vacationMode: !formData.vacationMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.vacationMode ? 'bg-orange-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.vacationMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Working Days & Hours</h3>
          <p className="text-sm text-slate-600 mb-4">
            Set your preferred working schedule. This helps clients know when you're typically available.
          </p>

          <div className="space-y-3">
            {formData.workingDays.map((dayData, index) => (
              <div
                key={dayData.day}
                className={`p-4 rounded-lg border-2 transition-all ${
                  dayData.enabled
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dayData.enabled}
                      onChange={() => toggleDay(index)}
                      className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-3 font-medium text-slate-900 capitalize">
                      {dayNames[index]}
                    </label>
                  </div>
                  {dayData.enabled && (
                    <Badge variant="info" size="sm">Active</Badge>
                  )}
                </div>

                {dayData.enabled && (
                  <div className="grid grid-cols-2 gap-3 ml-8">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={dayData.start}
                        onChange={(e) => updateDayTime(index, 'start', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={dayData.end}
                        onChange={(e) => updateDayTime(index, 'end', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

const PaymentSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Bank & Payment Settings</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">
        <p className="text-slate-600 mb-4">
          Manage your bank account and payment details
        </p>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            Payment settings functionality will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

const VerificationSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Verification & Compliance</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">
        <p className="text-slate-600 mb-4">
          Upload verification documents to build trust
        </p>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-800">
            Verification settings functionality will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

const LocationSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    gpsTrackingEnabled: false,
    currentLatitude: null as number | null,
    currentLongitude: null as number | null,
    serviceRadiusKm: 5,
    lastLocationUpdate: null as string | null,
    providerId: null as string | null
  });

  useEffect(() => {
    fetchLocationData();
  }, [user]);

  const fetchLocationData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (providerError && providerError.code !== 'PGRST116') {
        throw providerError;
      }

      if (!providerData) {
        setError('Provider profile not found');
        return;
      }

      const { data: locationData, error: locationError } = await supabase
        .from('provider_location_settings')
        .select('*')
        .eq('provider_id', providerData.id)
        .maybeSingle();

      if (locationError && locationError.code !== 'PGRST116') {
        throw locationError;
      }

      if (locationData) {
        setFormData({
          gpsTrackingEnabled: locationData.gps_tracking_enabled ?? false,
          currentLatitude: locationData.current_latitude ? parseFloat(locationData.current_latitude) : null,
          currentLongitude: locationData.current_longitude ? parseFloat(locationData.current_longitude) : null,
          serviceRadiusKm: locationData.service_radius_km ?? 5,
          lastLocationUpdate: locationData.last_location_update,
          providerId: providerData.id
        });
      } else {
        setFormData({ ...formData, providerId: providerData.id });
      }
    } catch (err: any) {
      console.error('Error fetching location data:', err);
      setError(err.message || 'Failed to load location data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          currentLatitude: position.coords.latitude,
          currentLongitude: position.coords.longitude,
          lastLocationUpdate: new Date().toISOString()
        });
        setGettingLocation(false);
        setSuccess('Location updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      },
      (error) => {
        setGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An unknown error occurred while getting location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSave = async () => {
    if (!user?.id || !formData.providerId) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data: existingData } = await supabase
        .from('provider_location_settings')
        .select('id')
        .eq('provider_id', formData.providerId)
        .maybeSingle();

      const locationData = {
        provider_id: formData.providerId,
        gps_tracking_enabled: formData.gpsTrackingEnabled,
        current_latitude: formData.currentLatitude,
        current_longitude: formData.currentLongitude,
        service_radius_km: formData.serviceRadiusKm,
        last_location_update: formData.lastLocationUpdate
      };

      if (existingData) {
        const { error: updateError } = await supabase
          .from('provider_location_settings')
          .update(locationData)
          .eq('provider_id', formData.providerId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('provider_location_settings')
          .insert([locationData]);

        if (insertError) throw insertError;
      }

      setSuccess('Location settings updated successfully');

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err: any) {
      console.error('Error saving location settings:', err);
      setError(err.message || 'Failed to update location settings');
    } finally {
      setSaving(false);
    }
  };

  const formatLocation = (lat: number | null, lon: number | null) => {
    if (!lat || !lon) return 'Not set';
    return `${lat.toFixed(6)}°, ${lon.toFixed(6)}°`;
  };

  const formatLastUpdate = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Location Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Location Settings</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center">
            <Check className="w-4 h-4 mr-2" />
            {success}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            About Location Settings
          </h3>
          <p className="text-sm text-blue-800">
            Enable GPS tracking to share your real-time location with clients during bookings.
            Set your service radius to control how far you're willing to travel for jobs.
            If GPS is disabled, your city location will be used instead.
          </p>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">GPS Tracking</h3>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${formData.gpsTrackingEnabled ? 'bg-green-500' : 'bg-slate-400'}`}></div>
              <div>
                <p className="font-medium text-slate-900">
                  Live GPS Tracking
                </p>
                <p className="text-sm text-slate-600">
                  {formData.gpsTrackingEnabled ? 'Location sharing enabled' : 'Location sharing disabled'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setFormData({ ...formData, gpsTrackingEnabled: !formData.gpsTrackingEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.gpsTrackingEnabled ? 'bg-green-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.gpsTrackingEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {formData.gpsTrackingEnabled && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 mb-1">Current Location</p>
                    <p className="text-lg font-mono text-slate-900">
                      {formatLocation(formData.currentLatitude, formData.currentLongitude)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={getCurrentLocation}
                    loading={gettingLocation}
                    className="flex items-center"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {gettingLocation ? 'Getting...' : 'Update'}
                  </Button>
                </div>
                {formData.lastLocationUpdate && (
                  <p className="text-xs text-slate-500">
                    Last updated: {formatLastUpdate(formData.lastLocationUpdate)}
                  </p>
                )}
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Privacy Note</p>
                    <p>
                      Your location is only shared with clients during active bookings.
                      Location data is encrypted and never shared publicly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Service Radius</h3>
          <p className="text-sm text-slate-600 mb-4">
            Set the maximum distance you're willing to travel from your current location for jobs.
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Maximum Service Radius
                </label>
                <span className="text-lg font-bold text-blue-600">
                  {formData.serviceRadiusKm} km
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={formData.serviceRadiusKm}
                onChange={(e) => setFormData({ ...formData, serviceRadiusKm: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1 km</span>
                <span>5 km</span>
                <span>10 km (Max)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[3, 5, 10].map((radius) => (
                <button
                  key={radius}
                  onClick={() => setFormData({ ...formData, serviceRadiusKm: radius })}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    formData.serviceRadiusKm === radius
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="text-lg font-bold">{radius} km</div>
                  <div className="text-xs">
                    {radius === 3 && 'Nearby'}
                    {radius === 5 && 'Moderate'}
                    {radius === 10 && 'Extended'}
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-slate-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-slate-600">
                  <p className="font-medium text-slate-900 mb-1">How it works</p>
                  <p>
                    Clients within your service radius will see you in their search results.
                    The distance is calculated from your {formData.gpsTrackingEnabled ? 'current GPS location' : 'city location'}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

const NotificationSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">
        <p className="text-slate-600 mb-4">
          Manage your notification preferences
        </p>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-800">
            Notification settings functionality will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

const PrivacySettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    showDistanceToClients: true,
    showRatings: true,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchPrivacySettings();
  }, [user]);

  const fetchPrivacySettings = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('show_distance_to_clients, show_ratings')
        .eq('user_id', user.id)
        .maybeSingle();

      if (providerError && providerError.code !== 'PGRST116') {
        throw providerError;
      }

      if (providerData) {
        setFormData({
          ...formData,
          showDistanceToClients: providerData.show_distance_to_clients ?? true,
          showRatings: providerData.show_ratings ?? true
        });
      }
    } catch (err: any) {
      console.error('Error fetching privacy settings:', err);
      setError(err.message || 'Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    if (!user?.id) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error: providerError } = await supabase
        .from('providers')
        .update({
          show_distance_to_clients: formData.showDistanceToClients,
          show_ratings: formData.showRatings
        })
        .eq('user_id', user.id);

      if (providerError) throw providerError;

      setSuccess('Privacy settings updated successfully');

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err: any) {
      console.error('Error saving privacy settings:', err);
      setError(err.message || 'Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (updateError) throw updateError;

      setSuccess('Password updated successfully');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
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

  if (loading) {
    return (
      <div>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Privacy Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Privacy Settings</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center">
            <Check className="w-4 h-4 mr-2" />
            {success}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            About Privacy Settings
          </h3>
          <p className="text-sm text-blue-800">
            Control how your profile information is displayed to clients and manage your account security.
          </p>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Profile Visibility</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="font-medium text-slate-900">Show distance to clients</p>
                <p className="text-sm text-slate-600">
                  Display your distance from clients in search results
                </p>
              </div>
              <button
                onClick={() => setFormData({ ...formData, showDistanceToClients: !formData.showDistanceToClients })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.showDistanceToClients ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.showDistanceToClients ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="font-medium text-slate-900">Show ratings</p>
                <p className="text-sm text-slate-600">
                  Display your rating and reviews on your profile
                </p>
              </div>
              <button
                onClick={() => setFormData({ ...formData, showRatings: !formData.showRatings })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.showRatings ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.showRatings ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSavePrivacy}
              loading={saving}
              size="sm"
            >
              Save Privacy Settings
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Security & Password
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-medium text-slate-900 mb-3">Change Password</h4>
              <div className="space-y-3">
                <Input
                  label="New Password"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  placeholder="Enter new password"
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                />

                <Button
                  onClick={handleChangePassword}
                  loading={changingPassword}
                  disabled={!formData.newPassword || !formData.confirmPassword}
                  size="sm"
                  className="w-full"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Two-Factor Authentication (2FA)</p>
                  <p className="text-sm text-slate-600">Add an extra layer of security to your account</p>
                </div>
                <Badge variant="neutral" size="sm">Coming Soon</Badge>
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">Logout</h4>
              <p className="text-sm text-red-800 mb-3">
                Sign out of your account on this device
              </p>
              <Button
                onClick={handleLogout}
                variant="danger"
                size="sm"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout from Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const AccountSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Account Management</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">
        <p className="text-slate-600 mb-4">
          Pause, deactivate, or delete your account
        </p>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-800">
            Account management functionality will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

const SupportSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Support & Help</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">
        <p className="text-slate-600 mb-4">
          Get help, view FAQs, and contact support
        </p>
        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
          <p className="text-sm text-teal-800">
            Support settings functionality will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderSettings;
