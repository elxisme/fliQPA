import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ServiceManagementModal } from '../../components/provider/ServiceManagementModal';
import { supabase } from '../../lib/supabase';
import {
  ArrowLeft,
  Plus,
  Settings,
  LogOut,
  Edit,
  ToggleLeft,
  ToggleRight,
  Menu
} from 'lucide-react';

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

const Services = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (user?.role !== 'provider') {
      navigate('/');
      return;
    }
    if (!user.hasCompletedOnboarding) {
      navigate('/provider/onboarding');
      return;
    }
    fetchServices();
  }, [user, navigate]);

  const fetchServices = async () => {
    try {
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (providerError) throw providerError;

      if (providerData?.id) {
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('provider_id', providerData.id)
          .order('created_at', { ascending: false });

        if (servicesError) throw servicesError;
        setServices(servicesData || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
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

  const handleToggleService = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ active: !currentStatus })
        .eq('id', serviceId);

      if (error) throw error;

      fetchServices();
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
              <Button
                variant="ghost"
                onClick={() => navigate('/provider/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <img src="/fliQ_logo.png" alt="fliQ" className="h-8" />
              <Badge variant="info" className="ml-3">Provider</Badge>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/provider/settings')} className="flex items-center">
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

        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-2">
            <div className="space-y-2">
              <Button variant="ghost" onClick={() => navigate('/provider/settings')} className="w-full justify-start">
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
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Services</h1>
            <p className="text-slate-600 mt-2">
              Manage your service offerings and pricing
            </p>
          </div>
          <Button
            className="flex items-center mt-4 sm:mt-0"
            onClick={() => navigate('/provider/add-services')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Service
          </Button>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded mb-4"></div>
                <div className="h-20 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded mb-4"></div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </Card>
            ))}
          </div>
        ) : services.length === 0 ? (
          <Card className="p-12 text-center">
            <Plus className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">
              No services yet
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Create your first service to start receiving bookings from clients.
              You can offer different packages with flexible pricing options.
            </p>
            <Button onClick={() => navigate('/provider/add-services')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Service
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="p-6 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-slate-900 flex-1 mr-2">
                    {service.title}
                  </h3>
                  <Badge variant={service.active ? 'success' : 'neutral'}>
                    {service.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <p className="text-slate-600 mb-4 flex-1 line-clamp-3">
                  {service.description}
                </p>

                <div className="space-y-2 mb-4 py-3 border-t border-slate-200">
                  {service.price_hour && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Hourly Rate</span>
                      <span className="font-semibold text-slate-900">
                        ₦{service.price_hour.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {service.price_day && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Daily Rate</span>
                      <span className="font-semibold text-slate-900">
                        ₦{service.price_day.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {service.price_week && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Weekly Rate</span>
                      <span className="font-semibold text-slate-900">
                        ₦{service.price_week.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                    <span className="text-slate-600">Min. Booking</span>
                    <span className="font-medium text-slate-900">
                      {service.min_booking_hours} {service.min_booking_hours === 1 ? 'hour' : 'hours'}
                    </span>
                  </div>
                </div>

                {service.extras && service.extras.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate-500 uppercase mb-2">Extras Available</p>
                    <div className="flex flex-wrap gap-1">
                      {service.extras.map((extra, idx) => (
                        <Badge key={idx} variant="info" size="sm">
                          {extra.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 mt-auto pt-4 border-t border-slate-200">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditService(service)}
                    className="flex-1 flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={service.active ? 'danger' : 'primary'}
                    onClick={() => handleToggleService(service.id, service.active)}
                    className="flex-1 flex items-center justify-center"
                  >
                    {service.active ? (
                      <>
                        <ToggleRight className="w-4 h-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 mr-2" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {services.length > 0 && (
          <div className="mt-8 text-center text-sm text-slate-500">
            <p>
              Showing {services.length} {services.length === 1 ? 'service' : 'services'}
            </p>
          </div>
        )}
      </div>

      <ServiceManagementModal
        service={selectedService}
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setSelectedService(null);
        }}
        onUpdate={fetchServices}
      />
    </div>
  );
};

export default Services;
