import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { 
  Star, 
  MapPin, 
  Clock, 
  Shield, 
  ArrowLeft,
  MessageCircle,
  Calendar
} from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  email: string;
  city: string;
  profile_base_price: number;
  verification_status: any;
  provider: {
    category: string;
    bio: string;
    rating: number;
  };
  services: Array<{
    id: string;
    title: string;
    description: string;
    price_hour?: number;
    price_day?: number;
    price_week?: number;
    min_booking_hours: number;
  }>;
}

const ProviderProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProvider();
    }
  }, [id]);

  const fetchProvider = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          providers (
            category,
            bio,
            rating
          ),
          services (
            id,
            title,
            description,
            price_hour,
            price_day,
            price_week,
            min_booking_hours,
            active
          )
        `)
        .eq('id', id)
        .eq('role', 'provider')
        .single();

      if (error) throw error;

      const formattedProvider = {
        ...data,
        provider: data.providers?.[0] || {},
        services: data.services?.filter(s => s.active) || []
      };

      setProvider(formattedProvider);
    } catch (error) {
      console.error('Error fetching provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (serviceId?: string) => {
    const bookingPath = serviceId 
      ? `/book/${id}?service=${serviceId}`
      : `/book/${id}`;
    navigate(bookingPath);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Provider not found</h2>
          <p className="text-slate-600 mb-4">The provider you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/client/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/client/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-2xl font-bold text-blue-600">fliQ</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Provider Header */}
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {provider.name.charAt(0)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{provider.name}</h1>
                {provider.verification_status?.verified && (
                  <Badge variant="success" className="flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <Badge variant="info" className="capitalize">
                  {provider.provider.category}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-slate-600 mb-3">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {provider.city}
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                  {provider.provider.rating > 0 ? provider.provider.rating.toFixed(1) : 'New'}
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed">
                {provider.provider.bio || 'Professional service provider'}
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm text-slate-500 mb-1">Starting from</div>
              <div className="text-2xl font-bold text-slate-900">
                ₦{provider.profile_base_price?.toLocaleString()}/hr
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button 
              className="flex-1 flex items-center justify-center"
              onClick={() => handleBookService()}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Now
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 flex items-center justify-center"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        </Card>

        {/* Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Services</h2>
          
          {provider.services.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                General Services
              </h3>
              <p className="text-slate-600 mb-4">
                This provider offers general {provider.provider.category} services
              </p>
              <div className="text-lg font-semibold text-slate-900 mb-4">
                ₦{provider.profile_base_price?.toLocaleString()}/hour
              </div>
              <Button onClick={() => handleBookService()}>
                Book Service
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {provider.services.map((service) => (
                <Card 
                  key={service.id} 
                  className={`p-6 cursor-pointer transition-all ${
                    selectedService === service.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {service.title}
                  </h3>
                  
                  <p className="text-slate-600 mb-4 line-clamp-3">
                    {service.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {service.price_hour && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Hourly</span>
                        <span className="font-semibold">₦{service.price_hour.toLocaleString()}</span>
                      </div>
                    )}
                    {service.price_day && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Daily</span>
                        <span className="font-semibold">₦{service.price_day.toLocaleString()}</span>
                      </div>
                    )}
                    {service.price_week && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Weekly</span>
                        <span className="font-semibold">₦{service.price_week.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-slate-500 mb-4">
                    <Clock className="w-4 h-4 mr-1" />
                    Min. {service.min_booking_hours} hours
                  </div>

                  <Button 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookService(service.id);
                    }}
                  >
                    Book This Service
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Reviews & Ratings</h2>
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No reviews yet</h3>
            <p className="text-slate-600">Be the first to book and review this provider!</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProviderProfile;