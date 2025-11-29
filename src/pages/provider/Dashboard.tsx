import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ServiceManagementModal } from '../../components/provider/ServiceManagementModal';
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
  Plus,
  TrendingUp,
  Users
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

interface Service {
  id: string;
  title: string;
  description: string;
  price_hour?: number;
  price_day?: number;
  price_week?: number;
  min_booking_hours: number;
  extras?: any[];
  active: boolean;
}

const ProviderDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalEarnings: 0,
    rating: 0,
    activeServices: 0
  });
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

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

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user?.id);

      if (servicesError) throw servicesError;

      // Fetch provider stats
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('rating')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (providerError) throw providerError;

      setBookings(bookingsData || []);
      setServices(servicesData || []);
      setStats({
        totalBookings: bookingsData?.length || 0,
        totalEarnings: bookingsData?.reduce((sum, booking) => sum + (booking.final_amount || 0), 0) || 0,
        rating: providerData?.rating || 0,
        activeServices: servicesData?.filter(s => s.active).length || 0
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

  const handleToggleService = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ active: !currentStatus })
        .eq('id', serviceId);

      if (error) throw error;

      fetchDashboardData();
    } catch (error) {
      console.error('Error toggling service status:', error);
    }
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setShowServiceModal(true);
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                bookings.map((booking) => (
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
                ))
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Your Services</h2>
              <Button
                size="sm"
                className="flex items-center"
                onClick={() => navigate('/provider/add-services')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            <div className="space-y-4">
              {services.length === 0 ? (
                <Card className="p-8 text-center">
                  <Plus className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No services yet
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Create your first service to start receiving bookings.
                  </p>
                  <Button onClick={() => navigate('/provider/add-services')}>
                    Create Service
                  </Button>
                </Card>
              ) : (
                services.map((service) => (
                  <Card key={service.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-slate-900">{service.title}</h3>
                      <Badge variant={service.active ? 'success' : 'neutral'}>
                        {service.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-slate-600">
                      {service.price_hour && (
                        <div>Hourly: ₦{service.price_hour.toLocaleString()}</div>
                      )}
                      {service.price_day && (
                        <div>Daily: ₦{service.price_day.toLocaleString()}</div>
                      )}
                      {service.price_week && (
                        <div>Weekly: ₦{service.price_week.toLocaleString()}</div>
                      )}
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditService(service)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={service.active ? 'danger' : 'primary'}
                        onClick={() => handleToggleService(service.id, service.active)}
                      >
                        {service.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <ServiceManagementModal
        service={selectedService}
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setSelectedService(null);
        }}
        onUpdate={fetchDashboardData}
      />
    </div>
  );
};

export default ProviderDashboard;