import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Filter,
  Users,
  Shield,
  Headphones,
  Menu,
  Wallet,
  Settings,
  LogOut
} from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  category: string;
  bio: string;
  rating: number;
  city: string;
  profile_base_price: number;
  verification_status: any;
  services: any[];
}

const ClientDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const categories = [
    { id: 'companion', name: 'Companions', icon: Users, color: 'bg-blue-500' },
    { id: 'bouncer', name: 'Security', icon: Shield, color: 'bg-green-500' },
    { id: 'bodyguard', name: 'Bodyguards', icon: Shield, color: 'bg-red-500' },
    { id: 'assistant', name: 'Assistants', icon: Headphones, color: 'bg-purple-500' }
  ];

  useEffect(() => {
    if (user?.role !== 'client') {
      navigate('/');
      return;
    }
    fetchProviders();
  }, [user, navigate]);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          providers (
            id,
            category,
            bio,
            rating
          ),
          services (
            id,
            title,
            price_hour,
            price_day,
            price_week
          )
        `)
        .eq('role', 'provider')
        .limit(20);

      if (error) throw error;

      const formattedProviders = data?.map(user => ({
        id: user.id,
        name: user.name,
        category: user.providers?.[0]?.category || '',
        bio: user.providers?.[0]?.bio || '',
        rating: user.providers?.[0]?.rating || 0,
        city: user.city,
        profile_base_price: user.profile_base_price || 0,
        verification_status: user.verification_status,
        services: user.services || []
      })) || [];

      setProviders(formattedProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || provider.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
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
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" className="flex items-center">
                <Wallet className="w-4 h-4 mr-2" />
                Wallet
              </Button>
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
                <Wallet className="w-4 h-4 mr-2" />
                Wallet
              </Button>
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
            Find and book professional services in your area
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search by name, category, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={!selectedCategory ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('')}
            >
              All Categories
            </Button>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Provider Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="w-16 h-16 bg-slate-200 rounded-full mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded mb-4"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => {
              const categoryData = categories.find(c => c.id === provider.category);
              const Icon = categoryData?.icon || Users;
              const minPrice = provider.services.length > 0 
                ? Math.min(...provider.services.map(s => s.price_hour || s.price_day || s.price_week))
                : provider.profile_base_price;

              return (
                <Card 
                  key={provider.id} 
                  className="p-6 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => navigate(`/provider/${provider.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 ${categoryData?.color || 'bg-slate-500'} rounded-full flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <Badge variant="info" className="capitalize">
                      {provider.category}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {provider.name}
                  </h3>
                  
                  <div className="flex items-center mb-2">
                    <MapPin className="w-4 h-4 text-slate-400 mr-1" />
                    <span className="text-sm text-slate-600">{provider.city}</span>
                  </div>

                  <div className="flex items-center mb-3">
                    <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                    <span className="text-sm text-slate-600">
                      {provider.rating > 0 ? provider.rating.toFixed(1) : 'New'}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {provider.bio || 'Professional service provider'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-slate-500">Starting from</span>
                      <div className="text-lg font-semibold text-slate-900">
                        ₦{minPrice?.toLocaleString()}/hr
                      </div>
                    </div>
                    <Button size="sm">
                      View Profile
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {filteredProviders.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No providers found
            </h3>
            <p className="text-slate-600 mb-4">
              Try adjusting your search or filters
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;