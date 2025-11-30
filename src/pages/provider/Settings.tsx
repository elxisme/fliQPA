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
  X
} from 'lucide-react';

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
    description: 'Control your profile visibility',
    icon: Eye,
    color: 'bg-pink-100 text-pink-600'
  },
  {
    id: 'security',
    title: 'Security & Password',
    description: 'Change password and security options',
    icon: Lock,
    color: 'bg-slate-100 text-slate-600'
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
      case 'security':
        return <SecuritySettings onClose={handleCloseModal} />;
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
  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Profile Information</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">
        <p className="text-slate-600 mb-4">
          Update your personal details and profile information
        </p>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            Profile settings functionality will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

const ServiceSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Service Information</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">
        <p className="text-slate-600 mb-4">
          Manage your primary category and base pricing
        </p>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            Service settings functionality will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

const AvailabilitySettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Availability & Schedule</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">
        <p className="text-slate-600 mb-4">
          Set your working hours and availability status
        </p>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800">
            Availability settings functionality will be implemented here.
          </p>
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
  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Location Settings</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">
        <p className="text-slate-600 mb-4">
          Control GPS tracking and service radius
        </p>
        <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
          <p className="text-sm text-cyan-800">
            Location settings functionality will be implemented here.
          </p>
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
  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Privacy Settings</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">
        <p className="text-slate-600 mb-4">
          Control your profile visibility and privacy
        </p>
        <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
          <p className="text-sm text-pink-800">
            Privacy settings functionality will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

const SecuritySettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Security & Password</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">
        <p className="text-slate-600 mb-4">
          Change password and manage security options
        </p>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-800">
            Security settings functionality will be implemented here.
          </p>
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
