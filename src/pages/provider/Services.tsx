import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/ui/Toaster';
import { ArrowLeft, Plus, CreditCard as Edit, Trash2, Eye, EyeOff, DollarSign, Clock, X } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  price_hour?: number;
  price_day?: number;
  price_week?: number;
  min_booking_hours: number;
  extras: Array<{ name: string; price: number }>;
  active: boolean;
}

interface Extra {
  name: string;
  price: string;
}

const Services = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pricingType: 'hourly',
    priceHour: '',
    priceDay: '',
    priceWeek: '',
    minBookingHours: '1',
    extras: [] as Extra[]
  });

  const [newExtra, setNewExtra] = useState({ name: '', price: '' });

  useEffect(() => {
    if (user?.role !== 'provider') {
      navigate('/');
      return;
    }
    fetchServices();
  }, [user, navigate]);

  const fetchServices = async () => {
    try {
      // First get the provider ID
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (providerError) throw providerError;

      if (!providerData) {
        // Provider hasn't completed onboarding
        navigate('/provider/onboarding');
        return;
      }

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', providerData.id)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;

      setServices(servicesData || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load services'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      pricingType: 'hourly',
      priceHour: '',
      priceDay: '',
      priceWeek: '',
      minBookingHours: '1',
      extras: []
    });
    setNewExtra({ name: '', price: '' });
    setEditingService(null);
    setShowAddForm(false);
  };

  const handleAddExtra = () => {
    if (newExtra.name && newExtra.price) {
      setFormData({
        ...formData,
        extras: [...formData.extras, newExtra]
      });
      setNewExtra({ name: '', price: '' });
    }
  };

  const handleRemoveExtra = (index: number) => {
    setFormData({
      ...formData,
      extras: formData.extras.filter((_, i) => i !== index)
    });
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      pricingType: service.price_hour ? 'hourly' : service.price_day ? 'daily' : 'weekly',
      priceHour: service.price_hour?.toString() || '',
      priceDay: service.price_day?.toString() || '',
      priceWeek: service.price_week?.toString() || '',
      minBookingHours: service.min_booking_hours.toString(),
      extras: service.extras.map(e => ({ name: e.name, price: e.price.toString() }))
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Get provider ID
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (providerError) throw providerError;

      const serviceData = {
        provider_id: providerData.id,
        title: formData.title,
        description: formData.description,
        price_hour: formData.pricingType === 'hourly' ? parseFloat(formData.priceHour) : null,
        price_day: formData.pricingType === 'daily' ? parseFloat(formData.priceDay) : null,
        price_week: formData.pricingType === 'weekly' ? parseFloat(formData.priceWeek) : null,
        min_booking_hours: parseInt(formData.minBookingHours),
        extras: formData.extras.map(e => ({ name: e.name, price: parseFloat(e.price) })),
        active: true
      };

      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;

        addToast({
          type: 'success',
          title: 'Success',
          message: 'Service updated successfully'
        });
      } else {
        // Create new service
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);

        if (error) throw error;

        addToast({
          type: 'success',
          title: 'Success',
          message: 'Service added successfully'
        });
      }

      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to save service'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ active: !service.active })
        .eq('id', service.id);

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Success',
        message: `Service ${service.active ? 'deactivated' : 'activated'} successfully`
      });

      fetchServices();
    } catch (error) {
      console.error('Error toggling service:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update service'
      });
    }
  };

  const handleDeleteService = async (service: Service) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', service.id);

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Success',
        message: 'Service deleted successfully'
      });

      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete service'
      });
    }
  };

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
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/provider/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="text-2xl font-bold text-blue-600">fliQ</div>
            </div>
            
            <Button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Manage Your Services</h1>
          <p className="text-slate-600 mt-2">
            Add and manage the services you offer to clients
          </p>
        </div>

        {/* Add/Edit Service Form */}
        {showAddForm && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <Button variant="ghost" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Service Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Event Security, Personal Protection"
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Pricing Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.pricingType}
                    onChange={(e) => setFormData({...formData, pricingType: e.target.value})}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Service Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe what this service includes..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.pricingType === 'hourly' && (
                  <Input
                    label="Hourly Rate (₦)"
                    type="number"
                    value={formData.priceHour}
                    onChange={(e) => setFormData({...formData, priceHour: e.target.value})}
                    placeholder="5000"
                    required
                  />
                )}
                
                {formData.pricingType === 'daily' && (
                  <Input
                    label="Daily Rate (₦)"
                    type="number"
                    value={formData.priceDay}
                    onChange={(e) => setFormData({...formData, priceDay: e.target.value})}
                    placeholder="50000"
                    required
                  />
                )}
                
                {formData.pricingType === 'weekly' && (
                  <Input
                    label="Weekly Rate (₦)"
                    type="number"
                    value={formData.priceWeek}
                    onChange={(e) => setFormData({...formData, priceWeek: e.target.value})}
                    placeholder="300000"
                    required
                  />
                )}

                <Input
                  label="Minimum Booking Hours"
                  type="number"
                  value={formData.minBookingHours}
                  onChange={(e) => setFormData({...formData, minBookingHours: e.target.value})}
                  min="1"
                  required
                />
              </div>

              {/* Extras Section */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Add Extras (Optional)
                </label>
                
                <div className="space-y-3">
                  {formData.extras.map((extra, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium">{extra.name}</span>
                      </div>
                      <div className="text-slate-600">
                        ₦{parseFloat(extra.price).toLocaleString()}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveExtra(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex space-x-3">
                    <Input
                      placeholder="Extra name (e.g., Equipment rental)"
                      value={newExtra.name}
                      onChange={(e) => setNewExtra({...newExtra, name: e.target.value})}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Price"
                      type="number"
                      value={newExtra.price}
                      onChange={(e) => setNewExtra({...newExtra, price: e.target.value})}
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddExtra}
                      disabled={!newExtra.name || !newExtra.price}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" loading={submitting} className="flex-1">
                  {editingService ? 'Update Service' : 'Add Service'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Services List */}
        <div className="space-y-4">
          {services.length === 0 ? (
            <Card className="p-8 text-center">
              <Plus className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No services yet
              </h3>
              <p className="text-slate-600 mb-4">
                Create your first service to start receiving bookings from clients.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                Add Your First Service
              </Button>
            </Card>
          ) : (
            services.map((service) => (
              <Card key={service.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {service.title}
                      </h3>
                      <Badge variant={service.active ? 'success' : 'neutral'}>
                        {service.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-slate-600 mb-3">{service.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-slate-600">
                      {service.price_hour && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ₦{service.price_hour.toLocaleString()}/hour
                        </div>
                      )}
                      {service.price_day && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ₦{service.price_day.toLocaleString()}/day
                        </div>
                      )}
                      {service.price_week && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ₦{service.price_week.toLocaleString()}/week
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Min. {service.min_booking_hours}h
                      </div>
                    </div>

                    {service.extras.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-slate-700 mb-2">Extras:</p>
                        <div className="flex flex-wrap gap-2">
                          {service.extras.map((extra, index) => (
                            <Badge key={index} variant="neutral" size="sm">
                              {extra.name} (+₦{extra.price.toLocaleString()})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(service)}
                    >
                      {service.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteService(service)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;