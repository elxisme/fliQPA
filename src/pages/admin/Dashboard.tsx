import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  DollarSign, 
  Activity, 
  AlertTriangle,
  Search,
  Filter,
  Check,
  X,
  Eye,
  Settings,
  LogOut
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  city: string;
  created_at: string;
  verification_status: any;
}

interface Booking {
  id: string;
  status: string;
  estimated_amount: number;
  created_at: string;
  client: { name: string };
  provider: { name: string };
}

interface Dispute {
  id: string;
  status: string;
  reason: string;
  created_at: string;
  booking: { id: string };
  raised_by: { name: string };
}

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingDisputes: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [user, navigate]);

  const fetchAdminData = async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          client:users!client_id(name),
          provider:users!provider_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (bookingsError) throw bookingsError;

      // Fetch disputes
      const { data: disputesData, error: disputesError } = await supabase
        .from('disputes')
        .select(`
          *,
          booking:bookings(id),
          raised_by:users(name)
        `)
        .order('created_at', { ascending: false });

      if (disputesError) throw disputesError;

      setUsers(usersData || []);
      setBookings(bookingsData || []);
      setDisputes(disputesData || []);

      // Calculate stats
      const providers = usersData?.filter(u => u.role === 'provider') || [];
      const totalRevenue = bookingsData?.reduce((sum, booking) => 
        sum + (booking.final_amount || 0), 0) || 0;
      const pendingDisputes = disputesData?.filter(d => d.status === 'OPEN').length || 0;

      setStats({
        totalUsers: usersData?.length || 0,
        totalProviders: providers.length,
        totalBookings: bookingsData?.length || 0,
        totalRevenue,
        pendingDisputes
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProvider = async (userId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          verification_status: { 
            ...users.find(u => u.id === userId)?.verification_status,
            verified: approved,
            verified_at: new Date().toISOString()
          }
        })
        .eq('id', userId);

      if (error) throw error;

      // Refresh data
      fetchAdminData();
    } catch (error) {
      console.error('Error updating verification:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_SERVICE': return 'info';
      case 'CANCELLED': return 'danger';
      case 'OPEN': return 'warning';
      case 'RESOLVED': return 'success';
      default: return 'neutral';
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/fliQ_logo.png" alt="fliQ" className="h-8" />
              <Badge variant="danger" className="ml-3">Admin</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="flex items-center">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-2">Manage users, bookings, and platform operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Providers</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalProviders}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Bookings</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalBookings}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Revenue</p>
                <p className="text-2xl font-bold text-slate-900">
                  ₦{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Disputes</p>
                <p className="text-2xl font-bold text-slate-900">{stats.pendingDisputes}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'users', name: 'Users' },
                { id: 'bookings', name: 'Bookings' },
                { id: 'disputes', name: 'Disputes' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={user.role === 'provider' ? 'info' : 'neutral'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {user.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={user.verification_status?.verified ? 'success' : 'warning'}>
                            {user.verification_status?.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {user.role === 'provider' && !user.verification_status?.verified && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleVerifyProvider(user.id, true)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="danger"
                                  onClick={() => handleVerifyProvider(user.id, false)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Recent Bookings</h2>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-slate-900">
                        {booking.client.name} → {booking.provider.name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusColor(booking.status) as any}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-lg font-semibold text-slate-900 mt-1">
                        ₦{booking.estimated_amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'disputes' && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Dispute Resolution</h2>
            <div className="space-y-4">
              {disputes.length === 0 ? (
                <Card className="p-8 text-center">
                  <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No disputes</h3>
                  <p className="text-slate-600">All bookings are running smoothly!</p>
                </Card>
              ) : (
                disputes.map((dispute) => (
                  <Card key={dispute.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-slate-900">
                          Dispute #{dispute.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-slate-600">
                          Raised by {dispute.raised_by.name} • {new Date(dispute.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(dispute.status) as any}>
                        {dispute.status}
                      </Badge>
                    </div>
                    <p className="text-slate-700 mb-4">{dispute.reason}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {dispute.status === 'OPEN' && (
                        <Button size="sm">
                          Resolve
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;