import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import {
  Calendar,
  DollarSign,
  Star,
  Clock,
  MapPin,
  Settings,
  LogOut,
  Menu,
  TrendingUp,
  Users,
  Package,
  ArrowRight
} from 'lucide-react';

interface Booking {
  id: string;
  status: string;
  requested_start: string;
  requested_end: string;
  estimated_amount: number;
  client: {
    name: string;
    city: string;
  };
}

const ProviderDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalEarnings: 0,
    rating: 0,
    activeServices: 0
  });
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (user?.role !== 'provider') {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch today's bookings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          client:users!client_id (
            name,
            city
          )
        `)
        .eq('provider_id', user?.id)
        .order('requested_start', { ascending: true })
        .limit(20);

      if (bookingsError) throw bookingsError;

      // Fetch provider data first
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('id, rating')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (providerError) throw providerError;

      // Fetch services count
      let activeServicesCount = 0;
      if (providerData?.id) {
        const { count, error: servicesError } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('provider_id', providerData.id)
          .eq('active', true);

        if (servicesError) throw servicesError;
        activeServicesCount = count || 0;
      }

      setBookings(bookingsData || []);
      setStats({
        totalBookings: bookingsData?.length || 0,
        totalEarnings: bookingsData?.reduce((sum, booking) => sum + (booking.final_amount || 0), 0) || 0,
        rating: providerData?.rating || 0,
        activeServices: activeServicesCount
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
      case 'REQUESTED': return 'warning';
      case 'ACCEPTED': return 'info';
      case 'IN_SERVICE': return 'info';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">fliQ</div>
              <Badge variant="info" className="ml-3">Provider</Badge>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
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

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-2">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-slate-600 mt-2">
            Manage your services and bookings
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Bookings</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalBookings}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Earnings</p>
                <p className="text-2xl font-bold text-slate-900">
                  ₦{stats.totalEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Rating</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.rating > 0 ? stats.rating.toFixed(1) : 'New'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Active Services</p>
                <p className="text-2xl font-bold text-slate-900">{stats.activeServices}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Today's Bookings */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Today's Bookings</h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {bookings.length === 0 ? (
                <Card className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No bookings yet
                  </h3>
                  <p className="text-slate-600">
                    Your bookings will appear here once clients start booking your services.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 text-slate-400 mr-2" />
                          <span className="font-medium text-slate-900">
                            {booking.client.name}
                          </span>
                        </div>
                        <Badge variant={getStatusColor(booking.status) as any}>
                          {booking.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="flex items-center text-sm text-slate-600 mb-2">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(booking.requested_start).toLocaleDateString()} at{' '}
                        {new Date(booking.requested_start).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>

                      <div className="flex items-center text-sm text-slate-600 mb-3">
                        <MapPin className="w-4 h-4 mr-2" />
                        {booking.client.city}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">
                          ₦{booking.estimated_amount.toLocaleString()}
                        </span>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card
                className="p-6 cursor-pointer hover:shadow-xl transition-all"
                onClick={() => navigate('/provider/services')}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Manage Services
                </h3>
                <p className="text-slate-600 text-sm mb-3">
                  View, edit, and manage all your service offerings
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="text-sm text-slate-500">Active Services</span>
                  <span className="text-lg font-bold text-blue-600">{stats.activeServices}</span>
                </div>
              </Card>

              <Card className="p-6 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    View All Bookings
                  </h3>
                  <p className="text-slate-600 text-sm">
                    See your complete booking history
                  </p>
                </div>
              </Card>

              <Card className="p-6 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    View Analytics
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Track your performance metrics
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;