import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  ArrowLeft,
  AlertTriangle,
  Shield,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  Settings as SettingsIcon,
  MessageSquare,
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
    id: 'disputes',
    title: 'Dispute Management System',
    description: 'Handle disputes, resolutions, and refunds',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-600'
  },
  {
    id: 'verification',
    title: 'Provider Verification Workflow',
    description: 'Review and approve provider applications',
    icon: Shield,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'users',
    title: 'User Management Features',
    description: 'Manage users, roles, and permissions',
    icon: Users,
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'bookings',
    title: 'Booking Management',
    description: 'Monitor and manage all bookings',
    icon: Calendar,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 'financial',
    title: 'Financial Management',
    description: 'Platform fees, payouts, and transactions',
    icon: DollarSign,
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    id: 'analytics',
    title: 'Reporting and Analytics',
    description: 'Platform metrics and performance reports',
    icon: BarChart3,
    color: 'bg-cyan-100 text-cyan-600'
  },
  {
    id: 'platform',
    title: 'Platform Settings and Configuration',
    description: 'System settings, fees, and parameters',
    icon: SettingsIcon,
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'communication',
    title: 'Communication Management',
    description: 'Notifications, emails, and announcements',
    icon: MessageSquare,
    color: 'bg-pink-100 text-pink-600'
  }
];

const AdminSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
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
      case 'disputes':
        return <DisputeManagement onClose={handleCloseModal} />;
      case 'verification':
        return <VerificationWorkflow onClose={handleCloseModal} />;
      case 'users':
        return <UserManagement onClose={handleCloseModal} />;
      case 'bookings':
        return <BookingManagement onClose={handleCloseModal} />;
      case 'financial':
        return <FinancialManagement onClose={handleCloseModal} />;
      case 'analytics':
        return <ReportingAnalytics onClose={handleCloseModal} />;
      case 'platform':
        return <PlatformConfiguration onClose={handleCloseModal} />;
      case 'communication':
        return <CommunicationManagement onClose={handleCloseModal} />;
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
              onClick={() => navigate('/admin/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <img src="/fliQ_logo.png" alt="fliQ" className="h-8" />
            <Badge variant="danger" className="ml-3">Admin</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Settings</h1>
          <p className="text-slate-600 mt-2">Manage platform settings and configurations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.id}
                className="p-6 cursor-pointer hover:shadow-xl transition-all"
                onClick={() => handleSectionClick(section.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {section.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {section.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {activeSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {renderSectionContent(activeSection)}
          </div>
        </div>
      )}
    </div>
  );
};

interface SectionProps {
  onClose: () => void;
}

const DisputeManagement: React.FC<SectionProps> = ({ onClose }) => {
  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dispute Management System</h2>
          <p className="text-slate-600 mt-1">Handle disputes, resolutions, and refunds</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <Card className="p-6 border-2 border-dashed border-slate-300">
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Dispute Management Coming Soon
            </h3>
            <p className="text-slate-600 mb-4">
              Dispute resolution workflow, automated refunds, and escalation procedures
            </p>
            <div className="text-sm text-slate-500 space-y-1">
              <p>• View and filter all disputes</p>
              <p>• Review evidence from both parties</p>
              <p>• Make resolution decisions</p>
              <p>• Process refunds and penalties</p>
              <p>• Track dispute resolution metrics</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const VerificationWorkflow: React.FC<SectionProps> = ({ onClose }) => {
  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Provider Verification Workflow</h2>
          <p className="text-slate-600 mt-1">Review and approve provider applications</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <Card className="p-6 border-2 border-dashed border-slate-300">
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Verification Workflow Coming Soon
            </h3>
            <p className="text-slate-600 mb-4">
              Provider verification queue, document review, and approval system
            </p>
            <div className="text-sm text-slate-500 space-y-1">
              <p>• Pending verification queue</p>
              <p>• Review provider documents</p>
              <p>• Background check integration</p>
              <p>• Approve or reject applications</p>
              <p>• Send verification status notifications</p>
              <p>• Manage verification criteria</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const UserManagement: React.FC<SectionProps> = ({ onClose }) => {
  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management Features</h2>
          <p className="text-slate-600 mt-1">Manage users, roles, and permissions</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <Card className="p-6 border-2 border-dashed border-slate-300">
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              User Management Coming Soon
            </h3>
            <p className="text-slate-600 mb-4">
              Advanced user management, role assignment, and account actions
            </p>
            <div className="text-sm text-slate-500 space-y-1">
              <p>• Search and filter users</p>
              <p>• View detailed user profiles</p>
              <p>• Suspend or ban accounts</p>
              <p>• Change user roles</p>
              <p>• Reset user passwords</p>
              <p>• Export user data</p>
              <p>• View user activity logs</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const BookingManagement: React.FC<SectionProps> = ({ onClose }) => {
  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Booking Management</h2>
          <p className="text-slate-600 mt-1">Monitor and manage all bookings</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <Card className="p-6 border-2 border-dashed border-slate-300">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Booking Management Coming Soon
            </h3>
            <p className="text-slate-600 mb-4">
              Comprehensive booking oversight, cancellations, and intervention tools
            </p>
            <div className="text-sm text-slate-500 space-y-1">
              <p>• View all platform bookings</p>
              <p>• Filter by status, date, and category</p>
              <p>• Cancel bookings with reason</p>
              <p>• Override booking status</p>
              <p>• View booking timeline and history</p>
              <p>• Monitor booking completion rates</p>
              <p>• Handle booking conflicts</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const FinancialManagement: React.FC<SectionProps> = ({ onClose }) => {
  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Financial Management</h2>
          <p className="text-slate-600 mt-1">Platform fees, payouts, and transactions</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <Card className="p-6 border-2 border-dashed border-slate-300">
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Financial Management Coming Soon
            </h3>
            <p className="text-slate-600 mb-4">
              Transaction monitoring, payout management, and financial reporting
            </p>
            <div className="text-sm text-slate-500 space-y-1">
              <p>• View all transactions</p>
              <p>• Manage pending payouts</p>
              <p>• Configure platform fees</p>
              <p>• Process manual refunds</p>
              <p>• Generate financial reports</p>
              <p>• Track revenue metrics</p>
              <p>• Export transaction data</p>
              <p>• Monitor payment gateway status</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const ReportingAnalytics: React.FC<SectionProps> = ({ onClose }) => {
  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reporting and Analytics</h2>
          <p className="text-slate-600 mt-1">Platform metrics and performance reports</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <Card className="p-6 border-2 border-dashed border-slate-300">
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Reporting and Analytics Coming Soon
            </h3>
            <p className="text-slate-600 mb-4">
              Comprehensive analytics dashboard and custom report generation
            </p>
            <div className="text-sm text-slate-500 space-y-1">
              <p>• Platform performance metrics</p>
              <p>• User growth and retention</p>
              <p>• Booking trends and patterns</p>
              <p>• Revenue and financial analytics</p>
              <p>• Provider performance ratings</p>
              <p>• Category and service popularity</p>
              <p>• Geographic distribution reports</p>
              <p>• Custom report builder</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const PlatformConfiguration: React.FC<SectionProps> = ({ onClose }) => {
  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Platform Settings and Configuration</h2>
          <p className="text-slate-600 mt-1">System settings, fees, and parameters</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <Card className="p-6 border-2 border-dashed border-slate-300">
          <div className="text-center py-8">
            <SettingsIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Platform Configuration Coming Soon
            </h3>
            <p className="text-slate-600 mb-4">
              Configure platform-wide settings, fees, and business rules
            </p>
            <div className="text-sm text-slate-500 space-y-1">
              <p>• Platform fee percentages</p>
              <p>• Provider commission splits</p>
              <p>• Service categories management</p>
              <p>• Booking time limits</p>
              <p>• Auto-completion settings</p>
              <p>• Payment gateway configuration</p>
              <p>• Terms and conditions updates</p>
              <p>• System maintenance mode</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const CommunicationManagement: React.FC<SectionProps> = ({ onClose }) => {
  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Communication Management</h2>
          <p className="text-slate-600 mt-1">Notifications, emails, and announcements</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <Card className="p-6 border-2 border-dashed border-slate-300">
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Communication Management Coming Soon
            </h3>
            <p className="text-slate-600 mb-4">
              Manage platform communications, templates, and broadcast messages
            </p>
            <div className="text-sm text-slate-500 space-y-1">
              <p>• Send platform-wide announcements</p>
              <p>• Email template management</p>
              <p>• Push notification settings</p>
              <p>• SMS notification configuration</p>
              <p>• Broadcast messages to user segments</p>
              <p>• Communication history logs</p>
              <p>• Automated email workflows</p>
              <p>• Support ticket management</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
