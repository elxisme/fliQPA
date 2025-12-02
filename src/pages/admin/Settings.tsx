import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
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
  X,
  Search,
  Eye,
  Edit,
  Ban,
  Unlock,
  Clock,
  MapPin,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  ZoomIn,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
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

interface ProviderVerification {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  category: string;
  bio: string;
  avatar_url?: string;
  verification_status: {
    verified: boolean;
    documents?: string[];
    submitted_at?: string;
    reviewed_at?: string;
    reviewed_by?: string;
    rejection_reason?: string;
  };
  created_at: string;
}

const VerificationWorkflow: React.FC<SectionProps> = ({ onClose }) => {
  const { user: currentUser } = useAuth();
  const [providers, setProviders] = useState<ProviderVerification[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedProvider, setSelectedProvider] = useState<ProviderVerification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, searchQuery, statusFilter]);

  const fetchProviders = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          *,
          providers (
            id,
            category,
            bio
          )
        `)
        .eq('role', 'provider')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      const formattedProviders = usersData?.map(user => ({
        id: user.providers?.[0]?.id || user.id,
        user_id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        category: user.providers?.[0]?.category || '',
        bio: user.providers?.[0]?.bio || '',
        avatar_url: user.avatar_url,
        verification_status: user.verification_status || { verified: false },
        created_at: user.created_at
      })) || [];

      setProviders(formattedProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = [...providers];

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter === 'pending') {
      filtered = filtered.filter(p =>
        !p.verification_status?.verified &&
        p.verification_status?.documents &&
        p.verification_status.documents.length > 0
      );
    } else if (statusFilter === 'verified') {
      filtered = filtered.filter(p => p.verification_status?.verified === true);
    } else if (statusFilter === 'rejected') {
      filtered = filtered.filter(p =>
        p.verification_status?.rejection_reason &&
        !p.verification_status?.verified
      );
    } else if (statusFilter === 'incomplete') {
      filtered = filtered.filter(p =>
        !p.verification_status?.documents ||
        p.verification_status.documents.length === 0
      );
    }

    setFilteredProviders(filtered);
  };

  const handleViewProvider = (provider: ProviderVerification) => {
    setSelectedProvider(provider);
    setShowDetailModal(true);
  };

  const handleVerificationAction = async (action: 'approve' | 'reject', rejectionReason?: string) => {
    if (!selectedProvider || !currentUser) return;

    setActionLoading(true);
    try {
      const newVerificationStatus = {
        ...selectedProvider.verification_status,
        verified: action === 'approve',
        reviewed_at: new Date().toISOString(),
        reviewed_by: currentUser.id,
        rejection_reason: action === 'reject' ? rejectionReason : null
      };

      const { error: updateError } = await supabase
        .from('users')
        .update({
          verification_status: newVerificationStatus
        })
        .eq('id', selectedProvider.user_id);

      if (updateError) throw updateError;

      const { error: logError } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: selectedProvider.user_id,
          admin_id: currentUser.id,
          action: action === 'approve' ? 'verification_approved' : 'verification_rejected',
          details: {
            category: selectedProvider.category,
            rejection_reason: rejectionReason
          }
        });

      if (logError) console.error('Error logging action:', logError);

      await fetchProviders();
      setShowDetailModal(false);
      setSelectedProvider(null);
    } catch (error) {
      console.error('Error updating verification:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getVerificationBadge = (provider: ProviderVerification) => {
    if (provider.verification_status?.verified) {
      return <Badge variant="success">Verified</Badge>;
    } else if (provider.verification_status?.rejection_reason) {
      return <Badge variant="danger">Rejected</Badge>;
    } else if (provider.verification_status?.documents && provider.verification_status.documents.length > 0) {
      return <Badge variant="warning">Pending Review</Badge>;
    } else {
      return <Badge variant="neutral">Incomplete</Badge>;
    }
  };

  const pendingCount = providers.filter(p =>
    !p.verification_status?.verified &&
    p.verification_status?.documents &&
    p.verification_status.documents.length > 0
  ).length;

  const verifiedCount = providers.filter(p => p.verification_status?.verified).length;
  const rejectedCount = providers.filter(p => p.verification_status?.rejection_reason).length;
  const incompleteCount = providers.filter(p =>
    !p.verification_status?.documents ||
    p.verification_status.documents.length === 0
  ).length;

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
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search by name, email, city, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Applications</option>
            <option value="pending">Pending Review ({pendingCount})</option>
            <option value="verified">Verified ({verifiedCount})</option>
            <option value="rejected">Rejected ({rejectedCount})</option>
            <option value="incomplete">Incomplete ({incompleteCount})</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-slate-600">Pending Review</div>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-slate-600">Verified</div>
            <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-slate-600">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-slate-600">Incomplete</div>
            <div className="text-2xl font-bold text-slate-600">{incompleteCount}</div>
          </Card>
        </div>

        {/* Providers Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No providers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredProviders.map((provider) => (
                    <tr key={provider.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {provider.avatar_url ? (
                            <img
                              src={provider.avatar_url}
                              alt={provider.name}
                              className="w-10 h-10 rounded-full object-cover mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                              {provider.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-slate-900">{provider.name}</div>
                            <div className="text-sm text-slate-500">{provider.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="info" className="capitalize">
                          {provider.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getVerificationBadge(provider)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {provider.verification_status?.submitted_at
                          ? new Date(provider.verification_status.submitted_at).toLocaleDateString()
                          : 'Not submitted'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProvider(provider)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="text-sm text-slate-500 text-center">
          Showing {filteredProviders.length} of {providers.length} providers
        </div>
      </div>

      {/* Provider Detail Modal */}
      {showDetailModal && selectedProvider && (
        <ProviderVerificationModal
          provider={selectedProvider}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProvider(null);
          }}
          onAction={handleVerificationAction}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

interface ProviderVerificationModalProps {
  provider: ProviderVerification;
  onClose: () => void;
  onAction: (action: 'approve' | 'reject', rejectionReason?: string) => void;
  loading: boolean;
}

const ProviderVerificationModal: React.FC<ProviderVerificationModalProps> = ({
  provider,
  onClose,
  onAction,
  loading
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);

  const documents = provider.verification_status?.documents || [];

  const handleApprove = () => {
    onAction('approve');
  };

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onAction('reject', rejectionReason);
      setShowRejectModal(false);
    }
  };

  const openDocument = (docUrl: string, index: number) => {
    setSelectedDocument(docUrl);
    setCurrentDocIndex(index);
  };

  const navigateDocument = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentDocIndex > 0) {
      setCurrentDocIndex(currentDocIndex - 1);
      setSelectedDocument(documents[currentDocIndex - 1]);
    } else if (direction === 'next' && currentDocIndex < documents.length - 1) {
      setCurrentDocIndex(currentDocIndex + 1);
      setSelectedDocument(documents[currentDocIndex + 1]);
    }
  };

  const isAlreadyReviewed = provider.verification_status?.reviewed_at;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Provider Verification Review</h3>
            <p className="text-sm text-slate-600 mt-1">Review application and documents</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider Information */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Provider Information</h4>
            <div className="flex items-start space-x-6 mb-6">
              {provider.avatar_url ? (
                <img
                  src={provider.avatar_url}
                  alt={provider.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {provider.name.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h5 className="text-xl font-bold text-slate-900 mb-2">{provider.name}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-slate-600">{provider.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-slate-600">{provider.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-slate-600">{provider.city}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Shield className="w-4 h-4 text-slate-400 mr-2" />
                    <Badge variant="info" className="capitalize">
                      {provider.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {provider.bio && (
              <div>
                <h6 className="text-sm font-medium text-slate-700 mb-2">Professional Bio</h6>
                <p className="text-slate-700 leading-relaxed">{provider.bio}</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Application Status:</span>
                <div className="flex items-center gap-2">
                  {provider.verification_status?.verified ? (
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : provider.verification_status?.rejection_reason ? (
                    <Badge variant="danger">
                      <XCircle className="w-3 h-3 mr-1" />
                      Rejected
                    </Badge>
                  ) : (
                    <Badge variant="warning">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Review
                    </Badge>
                  )}
                </div>
              </div>
              {provider.verification_status?.submitted_at && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-600">Submitted:</span>
                  <span className="text-slate-900">
                    {new Date(provider.verification_status.submitted_at).toLocaleString()}
                  </span>
                </div>
              )}
              {provider.verification_status?.reviewed_at && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-600">Reviewed:</span>
                  <span className="text-slate-900">
                    {new Date(provider.verification_status.reviewed_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {provider.verification_status?.rejection_reason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</div>
                <div className="text-sm text-red-700">{provider.verification_status.rejection_reason}</div>
              </div>
            )}
          </Card>

          {/* Documents Section */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">
              Verification Documents ({documents.length})
            </h4>

            {documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No documents submitted</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((docUrl, index) => (
                  <div
                    key={index}
                    className="border-2 border-slate-200 rounded-lg p-4 hover:border-blue-400 transition-all cursor-pointer group"
                    onClick={() => openDocument(docUrl, index)}
                  >
                    <div className="aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {docUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img
                          src={docUrl}
                          alt={`Document ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-12 h-12 text-slate-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">
                        Document {index + 1}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(docUrl, '_blank');
                          }}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          <Download className="w-4 h-4 text-slate-600" />
                        </button>
                        <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                          <ZoomIn className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          {!isAlreadyReviewed && documents.length > 0 && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowRejectModal(true)}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Application
              </Button>
              <Button
                onClick={handleApprove}
                loading={loading}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve & Verify
              </Button>
            </div>
          )}

          {isAlreadyReviewed && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-800">
                This application has already been reviewed on{' '}
                {new Date(provider.verification_status?.reviewed_at || '').toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
          <button
            onClick={() => setSelectedDocument(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {currentDocIndex > 0 && (
            <button
              onClick={() => navigateDocument('prev')}
              className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {currentDocIndex < documents.length - 1 && (
            <button
              onClick={() => navigateDocument('next')}
              className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
          )}

          <div className="max-w-5xl max-h-[90vh] w-full">
            {selectedDocument.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <img
                src={selectedDocument}
                alt="Document"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-700 mb-4">Preview not available for this file type</p>
                <Button
                  onClick={() => window.open(selectedDocument, '_blank')}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Document
                </Button>
              </div>
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-lg">
            <p className="text-white text-sm">
              Document {currentDocIndex + 1} of {documents.length}
            </p>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-xl font-bold text-slate-900">Reject Application</h3>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="font-medium text-slate-900">{provider.name}</div>
                <div className="text-sm text-slate-600">{provider.email}</div>
              </div>

              <p className="text-slate-700">
                Please provide a detailed reason for rejecting this application. The provider will be notified.
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rejection Reason (Required)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide specific reasons for rejection (e.g., unclear documents, missing information, quality concerns)..."
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  loading={loading}
                  variant="danger"
                  disabled={!rejectionReason.trim()}
                  className="flex-1"
                >
                  Reject Application
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  status: string;
  status_reason?: string;
  status_updated_at?: string;
  last_login_at?: string;
  created_at: string;
  verification_status?: any;
}

interface ActivityLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
  admin: {
    name: string;
  };
}

const UserManagement: React.FC<SectionProps> = ({ onClose }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState<'suspend' | 'ban' | 'activate'>('suspend');
  const [statusReason, setStatusReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchQuery) {
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone?.includes(searchQuery) ||
        u.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const fetchActivityLogs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select(`
          *,
          admin:users!user_activity_logs_admin_id_fkey(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivityLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setActivityLogs([]);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    fetchActivityLogs(user.id);
    setShowUserDetail(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleStatusAction = (user: User, action: 'suspend' | 'ban' | 'activate') => {
    setSelectedUser(user);
    setStatusAction(action);
    setStatusReason('');
    setShowStatusModal(true);
  };

  const handleSaveUserEdit = async (updatedData: Partial<User>) => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update(updatedData)
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      const { error: logError } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: selectedUser.id,
          admin_id: currentUser?.id,
          action: 'user_info_updated',
          details: { changes: updatedData }
        });

      if (logError) console.error('Error logging action:', logError);

      await fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmStatusAction = async () => {
    if (!selectedUser || !currentUser) return;

    setActionLoading(true);
    try {
      const newStatus = statusAction === 'activate' ? 'active' : statusAction === 'suspend' ? 'suspended' : 'banned';

      const { error: updateError } = await supabase
        .from('users')
        .update({
          status: newStatus,
          status_reason: statusAction !== 'activate' ? statusReason : null,
          status_updated_at: new Date().toISOString(),
          status_updated_by: currentUser.id
        })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      const { error: logError } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: selectedUser.id,
          admin_id: currentUser.id,
          action: `account_${statusAction}${statusAction !== 'activate' ? 'ed' : 'd'}`,
          details: { reason: statusReason, previous_status: selectedUser.status }
        });

      if (logError) console.error('Error logging action:', logError);

      await fetchUsers();
      setShowStatusModal(false);
      setSelectedUser(null);
      setStatusReason('');
    } catch (error) {
      console.error('Error updating user status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'suspended':
        return <Badge variant="warning">Suspended</Badge>;
      case 'banned':
        return <Badge variant="danger">Banned</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-600 mt-1">Manage users, roles, and account status</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search by name, email, phone, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="client">Client</option>
            <option value="provider">Provider</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-slate-600">Total Users</div>
            <div className="text-2xl font-bold text-slate-900">{users.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-slate-600">Active</div>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-slate-600">Suspended</div>
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter(u => u.status === 'suspended').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-slate-600">Banned</div>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.status === 'banned').length}
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.role === 'provider' ? 'info' : user.role === 'admin' ? 'danger' : 'neutral'} className="capitalize">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {user.status === 'active' ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStatusAction(user, 'suspend')}
                              >
                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStatusAction(user, 'ban')}
                              >
                                <Ban className="w-4 h-4 text-red-600" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusAction(user, 'activate')}
                            >
                              <Unlock className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="text-sm text-slate-500 text-center">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">User Details</h3>
              <button
                onClick={() => setShowUserDetail(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">{selectedUser.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={selectedUser.role === 'provider' ? 'info' : selectedUser.role === 'admin' ? 'danger' : 'neutral'} className="capitalize">
                        {selectedUser.role}
                      </Badge>
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-slate-600">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-slate-600">{selectedUser.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-slate-600">{selectedUser.city}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-slate-600">
                      Joined {new Date(selectedUser.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {selectedUser.status !== 'active' && selectedUser.status_reason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-sm font-medium text-red-900 mb-1">
                      {selectedUser.status === 'suspended' ? 'Suspension' : 'Ban'} Reason:
                    </div>
                    <div className="text-sm text-red-700">{selectedUser.status_reason}</div>
                    {selectedUser.status_updated_at && (
                      <div className="text-xs text-red-600 mt-1">
                        Updated {new Date(selectedUser.status_updated_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Activity Logs */}
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h4>
                {activityLogs.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No activity logs yet</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {activityLogs.map((log) => (
                      <Card key={log.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 capitalize">
                              {log.action.replace(/_/g, ' ')}
                            </div>
                            <div className="text-sm text-slate-600 mt-1">
                              By {log.admin.name} • {new Date(log.created_at).toLocaleString()}
                            </div>
                            {log.details && Object.keys(log.details).length > 0 && (
                              <div className="text-xs text-slate-500 mt-2 font-mono bg-slate-50 p-2 rounded">
                                {JSON.stringify(log.details, null, 2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleEditUser(selectedUser)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
                {selectedUser.status === 'active' ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleStatusAction(selectedUser, 'suspend')}
                      className="flex-1"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Suspend
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleStatusAction(selectedUser, 'ban')}
                      className="flex-1"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Ban
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleStatusAction(selectedUser, 'activate')}
                    className="flex-1"
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Reactivate Account
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveUserEdit}
          loading={actionLoading}
        />
      )}

      {/* Status Action Modal */}
      {showStatusModal && selectedUser && (
        <StatusActionModal
          user={selectedUser}
          action={statusAction}
          reason={statusReason}
          setReason={setStatusReason}
          onClose={() => setShowStatusModal(false)}
          onConfirm={handleConfirmStatusAction}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSave: (data: Partial<User>) => void;
  loading: boolean;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    role: user.role
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b border-slate-200 p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Edit User</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            label="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="client">Client</option>
              <option value="provider">Provider</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface StatusActionModalProps {
  user: User;
  action: 'suspend' | 'ban' | 'activate';
  reason: string;
  setReason: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const StatusActionModal: React.FC<StatusActionModalProps> = ({
  user,
  action,
  reason,
  setReason,
  onClose,
  onConfirm,
  loading
}) => {
  const actionConfig = {
    suspend: {
      title: 'Suspend User',
      description: 'Temporarily suspend this user account. They will not be able to log in until reactivated.',
      icon: AlertCircle,
      color: 'text-yellow-600',
      buttonText: 'Suspend Account'
    },
    ban: {
      title: 'Ban User',
      description: 'Permanently ban this user account. This is a serious action that should be used for policy violations.',
      icon: Ban,
      color: 'text-red-600',
      buttonText: 'Ban Account'
    },
    activate: {
      title: 'Reactivate User',
      description: 'Restore access to this user account.',
      icon: Unlock,
      color: 'text-green-600',
      buttonText: 'Reactivate Account'
    }
  };

  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center">
            <Icon className={`w-6 h-6 ${config.color} mr-3`} />
            <h3 className="text-xl font-bold text-slate-900">{config.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="font-medium text-slate-900">{user.name}</div>
            <div className="text-sm text-slate-600">{user.email}</div>
          </div>

          <p className="text-slate-700">{config.description}</p>

          {action !== 'activate' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason {action === 'ban' ? '(Required)' : '(Optional)'}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Provide a reason for ${action === 'suspend' ? 'suspending' : 'banning'} this account...`}
                required={action === 'ban'}
              />
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              loading={loading}
              variant={action === 'ban' ? 'danger' : 'primary'}
              disabled={action === 'ban' && !reason.trim()}
              className="flex-1"
            >
              {config.buttonText}
            </Button>
          </div>
        </div>
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
