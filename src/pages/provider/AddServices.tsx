import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { Plus, X, ArrowLeft, CheckCircle } from 'lucide-react';

interface ServiceExtra {
  name: string;
  price: number;
}

interface ServiceFormData {
  title: string;
  description: string;
  pricingType: 'hourly' | 'daily' | 'weekly' | 'multiple';
  priceHour: string;
  priceDay: string;
  priceWeek: string;
  minBookingHours: string;
  extras: ServiceExtra[];
}

const AddServices = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceFormData[]>([]);
  const [currentService, setCurrentService] = useState<ServiceFormData>({
    title: '',
    description: '',
    pricingType: 'hourly',
    priceHour: '',
    priceDay: '',
    priceWeek: '',
    minBookingHours: '1',
    extras: []
  });
  const [newExtra, setNewExtra] = useState({ name: '', price: '' });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddExtra = () => {
    if (newExtra.name && newExtra.price) {
      setCurrentService({
        ...currentService,
        extras: [...currentService.extras, {
          name: newExtra.name,
          price: parseFloat(newExtra.price)
        }]
      });
      setNewExtra({ name: '', price: '' });
    }
  };

  const handleRemoveExtra = (index: number) => {
    setCurrentService({
      ...currentService,
      extras: currentService.extras.filter((_, i) => i !== index)
    });
  };

  const handleAddService = () => {
    if (currentService.title && currentService.description) {
      setServices([...services, currentService]);
      setCurrentService({
        title: '',
        description: '',
        pricingType: 'hourly',
        priceHour: '',
        priceDay: '',
        priceWeek: '',
        minBookingHours: '1',
        extras: []
      });
    }
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleSkip = () => {
    navigate('/provider/dashboard');
  };

  const handleSubmit = async () => {
    if (services.length === 0) {
      handleSkip();
      return;
    }

    setLoading(true);
    try {
      const servicesToInsert = services.map(service => ({
        provider_id: user?.id,
        title: service.title,
        description: service.description,
        price_hour: service.pricingType === 'hourly' || service.pricingType === 'multiple'
          ? parseFloat(service.priceHour) : null,
        price_day: service.pricingType === 'daily' || service.pricingType === 'multiple'
          ? parseFloat(service.priceDay) : null,
        price_week: service.pricingType === 'weekly' || service.pricingType === 'multiple'
          ? parseFloat(service.priceWeek) : null,
        min_booking_hours: parseInt(service.minBookingHours),
        extras: service.extras.length > 0 ? service.extras : null,
        active: true
      }));

      const { error } = await supabase
        .from('services')
        .insert(servicesToInsert);

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/provider/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error creating services:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <Card className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Services Created!</h2>
          <p className="text-slate-600">
            Your services have been created successfully. Redirecting to dashboard...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Add Additional Services</h1>
          <p className="text-slate-600">
            Create specific service offerings within your category. This is optional but recommended
            to attract more clients with detailed packages.
          </p>
        </div>

        {/* Added Services List */}
        {services.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Your Services ({services.length})
            </h2>
            <div className="space-y-3">
              {services.map((service, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{service.title}</h3>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">{service.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {service.priceHour && (
                          <Badge variant="info" size="sm">₦{service.priceHour}/hr</Badge>
                        )}
                        {service.priceDay && (
                          <Badge variant="info" size="sm">₦{service.priceDay}/day</Badge>
                        )}
                        {service.priceWeek && (
                          <Badge variant="info" size="sm">₦{service.priceWeek}/week</Badge>
                        )}
                        {service.extras.length > 0 && (
                          <Badge variant="neutral" size="sm">{service.extras.length} extras</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveService(index)}
                      className="ml-4"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Service Form */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            {services.length === 0 ? 'Create Your First Service' : 'Add Another Service'}
          </h2>

          <div className="space-y-6">
            {/* Service Title */}
            <Input
              label="Service Title"
              value={currentService.title}
              onChange={(e) => setCurrentService({...currentService, title: e.target.value})}
              placeholder="e.g., Evening Event Companion, Personal Bodyguard Package"
              required
            />

            {/* Service Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Service Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                value={currentService.description}
                onChange={(e) => setCurrentService({...currentService, description: e.target.value})}
                placeholder="Describe what this service includes, what clients can expect, and any special features..."
                required
              />
            </div>

            {/* Pricing Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pricing Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'hourly', name: 'Hourly' },
                  { id: 'daily', name: 'Daily' },
                  { id: 'weekly', name: 'Weekly' },
                  { id: 'multiple', name: 'Multiple' }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    className={`p-3 border-2 rounded-lg transition-all text-center ${
                      currentService.pricingType === type.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setCurrentService({...currentService, pricingType: type.id as any})}
                  >
                    <div className="text-sm font-medium text-slate-900">{type.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(currentService.pricingType === 'hourly' || currentService.pricingType === 'multiple') && (
                <Input
                  label="Hourly Rate (₦)"
                  type="number"
                  value={currentService.priceHour}
                  onChange={(e) => setCurrentService({...currentService, priceHour: e.target.value})}
                  placeholder="5000"
                  required
                />
              )}
              {(currentService.pricingType === 'daily' || currentService.pricingType === 'multiple') && (
                <Input
                  label="Daily Rate (₦)"
                  type="number"
                  value={currentService.priceDay}
                  onChange={(e) => setCurrentService({...currentService, priceDay: e.target.value})}
                  placeholder="35000"
                  required
                />
              )}
              {(currentService.pricingType === 'weekly' || currentService.pricingType === 'multiple') && (
                <Input
                  label="Weekly Rate (₦)"
                  type="number"
                  value={currentService.priceWeek}
                  onChange={(e) => setCurrentService({...currentService, priceWeek: e.target.value})}
                  placeholder="200000"
                  required
                />
              )}
            </div>

            {/* Minimum Booking Hours */}
            <Input
              label="Minimum Booking Hours"
              type="number"
              value={currentService.minBookingHours}
              onChange={(e) => setCurrentService({...currentService, minBookingHours: e.target.value})}
              min="1"
              helperText="Minimum number of hours required for this service"
              required
            />

            {/* Service Extras */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Add Extras (Optional)
              </label>
              <p className="text-sm text-slate-500 mb-3">
                Add optional extras that clients can include with this service
              </p>

              {currentService.extras.length > 0 && (
                <div className="mb-4 space-y-2">
                  {currentService.extras.map((extra, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <span className="font-medium text-slate-900">{extra.name}</span>
                        <span className="text-slate-600 ml-2">+₦{extra.price.toLocaleString()}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveExtra(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Input
                  placeholder="Extra name (e.g., Premium vehicle)"
                  value={newExtra.name}
                  onChange={(e) => setNewExtra({...newExtra, name: e.target.value})}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Price"
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
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add Service Button */}
            <Button
              onClick={handleAddService}
              disabled={!currentService.title || !currentService.description ||
                (currentService.pricingType === 'hourly' && !currentService.priceHour) ||
                (currentService.pricingType === 'daily' && !currentService.priceDay) ||
                (currentService.pricingType === 'weekly' && !currentService.priceWeek) ||
                (currentService.pricingType === 'multiple' && !currentService.priceHour && !currentService.priceDay && !currentService.priceWeek)
              }
              className="w-full"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add This Service
            </Button>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1"
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={services.length === 0}
            className="flex-1"
          >
            {services.length === 0 ? 'Skip to Dashboard' : `Create ${services.length} Service${services.length > 1 ? 's' : ''}`}
          </Button>
        </div>

        {services.length === 0 && (
          <p className="text-center text-sm text-slate-500 mt-4">
            You can always add services later from your dashboard
          </p>
        )}
      </div>
    </div>
  );
};

export default AddServices;
