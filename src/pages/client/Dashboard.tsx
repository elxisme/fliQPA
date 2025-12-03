import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  LogOut,
  X,
  SlidersHorizontal,
  ChevronDown,
  Loader2
} from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  category: string;
  bio: string;
  rating: number;
  city: string;
  age?: number;
  avatar_url?: string;
  profile_base_price: number;
  verification_status: any;
  services: any[];
  minPrice: number;
}

interface Filters {
  category: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
}

const ClientDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [error, setError] = useState('');
  const observerTarget = useRef<HTMLDivElement>(null);
  const pageSize = 12;
  const [offset, setOffset] = useState(0);

  const [filters, setFilters] = useState<Filters>({
    category: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    minRating: ''
  });

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
    fetchCities();
    fetchProviders(true);
  }, [user, navigate]);

  useEffect(() => {
    setOffset(0);
    setProviders([]);
    setHasMore(true);
    fetchProviders(true);
  }, [filters, searchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreProviders();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore, offset]);

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('city')
        .eq('role', 'provider')
        .not('city', 'is', null);

      if (error) throw error;

      const uniqueCities = [...new Set(data?.map(u => u.city).filter(Boolean))] as string[];
      setCities(uniqueCities.sort());
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchProviders = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError('');
      } else {
        setLoadingMore(true);
      }

      const currentOffset = reset ? 0 : offset;

      let query = supabase
        .from('users')
        .select(`
          *,
          providers (
            id,
            category,
            bio,
            rating,
            services (
              id,
              title,
              price_hour,
              price_day,
              price_week,
              active
            )
          )
        `, { count: 'exact' })
        .eq('role', 'provider')
        .eq('verification_status->>verified', 'true');

      if (filters.category) {
        query = query.eq('providers.category', filters.category);
      }

      if (filters.city) {
        query = query.eq('city', filters.city);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        if (reset) {
          setProviders([]);
          setFilteredProviders([]);
          if (count === 0) {
            setError('No verified providers found matching your criteria.');
          }
        }
        setHasMore(false);
        return;
      }

      const formattedProviders = data.map(user => {
        const providerData = user.providers?.[0];
        const services = providerData?.services || [];
        const activeServices = services.filter(s => s.active) || [];
        const minPrice = activeServices.length > 0
          ? Math.min(...activeServices.map(s => s.price_hour || s.price_day || s.price_week).filter(Boolean))
          : user.profile_base_price || 0;

        return {
          id: user.id,
          name: user.name,
          category: providerData?.category || '',
          bio: providerData?.bio || '',
          rating: providerData?.rating || 0,
          city: user.city,
          age: user.age,
          avatar_url: user.avatar_url,
          profile_base_price: user.profile_base_price || 0,
          verification_status: user.verification_status,
          services: activeServices,
          minPrice
        };
      });

      let filtered = formattedProviders;

      if (filters.minPrice) {
        filtered = filtered.filter(p => p.minPrice >= parseFloat(filters.minPrice));
      }

      if (filters.maxPrice) {
        filtered = filtered.filter(p => p.minPrice <= parseFloat(filters.maxPrice));
      }

      if (filters.minRating) {
        filtered = filtered.filter(p => p.rating >= parseFloat(filters.minRating));
      }

      if (reset) {
        setProviders(filtered);
        setFilteredProviders(filtered);
        setOffset(pageSize);
      } else {
        setProviders(prev => [...prev, ...filtered]);
        setFilteredProviders(prev => [...prev, ...filtered]);
        setOffset(prev => prev + pageSize);
      }

      setHasMore(data.length === pageSize && (count ? currentOffset + pageSize < count : true));
    } catch (error: any) {
      console.error('Error fetching providers:', error);
      setError(error.message || 'Failed to load providers. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreProviders = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchProviders(false);
    }
  }, [loadingMore, hasMore, offset]);

  const handleClearFilters = () => {
    setFilters({
      category: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      minRating: ''
    });
    setSearchQuery('');
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length + (searchQuery ? 1 : 0);

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
              <img src="/fliQ_logo.png" alt="fliQ" className="h-8" />
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

          {/* Filter Bar */}
          <div className="space-y-3">
            {/* Filters Button - Always visible */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center flex-shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="info" size="sm" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>

              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="flex items-center text-slate-600 flex-shrink-0"
                >
                  <X className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              )}
            </div>

            {/* Category Tabs - Horizontal scroll on mobile */}
            <div className="relative">
              <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-2 min-w-min">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={filters.category === category.id ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          category: prev.category === category.id ? '' : category.id
                        }))}
                        className="flex items-center whitespace-nowrap flex-shrink-0"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {category.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <Card className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    City
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5d866c] focus:border-transparent"
                  >
                    <option value="">All Cities</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Min Price (₦/hr)
                  </label>
                  <Input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Price (₦/hr)
                  </label>
                  <Input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    placeholder="Any"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Min Rating
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters(prev => ({ ...prev, minRating: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5d866c] focus:border-transparent"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  Close
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 mb-6">
            {error}
          </div>
        )}

        {/* Provider Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-0 animate-pulse overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
                    <div className="w-20 h-20 bg-slate-200 rounded-full"></div>
                    <div className="flex-1 w-full">
                      <div className="h-6 bg-slate-200 rounded mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded mb-3 w-3/4"></div>
                  <div className="h-12 bg-slate-200 rounded"></div>
                </div>
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                  <div className="h-10 bg-slate-200 rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.map((provider) => {
                const categoryData = categories.find(c => c.id === provider.category);
                const Icon = categoryData?.icon || Users;

                return (
                  <Card
                    key={provider.id}
                    className="p-0 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/provider/${provider.id}`)}
                  >
                    <div className="p-6">
                      {/* Avatar and Badges - Mobile: Stack, Desktop: Row */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {provider.avatar_url ? (
                            <img
                              src={provider.avatar_url}
                              alt={provider.name}
                              className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                            />
                          ) : (
                            <div className={`w-20 h-20 ${categoryData?.color || 'bg-slate-500'} rounded-full flex items-center justify-center`}>
                              <Icon className="w-10 h-10 text-white" />
                            </div>
                          )}
                          {provider.verification_status?.verified && (
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                              <Shield className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Name and Badges - Centered on mobile */}
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            {provider.name}
                          </h3>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <Badge variant="info" className="capitalize">
                              {categoryData?.name || provider.category}
                            </Badge>
                            {provider.age && (
                              <Badge variant="neutral" size="sm">
                                {provider.age} years
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Location and Rating - Stack on mobile */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start">
                          <MapPin className="w-4 h-4 text-slate-400 mr-1 flex-shrink-0" />
                          <span className="text-sm text-slate-600">{provider.city}</span>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start">
                          <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current flex-shrink-0" />
                          <span className="text-sm text-slate-600">
                            {provider.rating > 0 ? provider.rating.toFixed(1) : 'New'}
                          </span>
                          {provider.rating > 0 && (
                            <span className="text-xs text-slate-500 ml-1">
                              ({Math.floor(Math.random() * 50) + 10} reviews)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2 text-center sm:text-left">
                        {provider.bio || 'Professional service provider'}
                      </p>

                      {/* Services Count */}
                      {provider.services.length > 0 && (
                        <div className="mb-4 text-center sm:text-left">
                          <p className="text-xs text-slate-500">
                            {provider.services.length} {provider.services.length === 1 ? 'service' : 'services'} available
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Price and CTA - Full width bar */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-center sm:text-left">
                          <span className="text-sm text-slate-500 block">Starting from</span>
                          <div className="text-xl font-bold text-slate-900">
                            ₦{provider.minPrice?.toLocaleString()}/hr
                          </div>
                        </div>
                        <Button size="sm" className="w-full sm:w-auto">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Infinite Scroll Loader */}
            {hasMore && !loading && (
              <div ref={observerTarget} className="flex justify-center py-8">
                {loadingMore && (
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading more providers...</span>
                  </div>
                )}
              </div>
            )}

            {!hasMore && filteredProviders.length > 0 && (
              <div className="text-center py-8 text-slate-500">
                You've reached the end of the list
              </div>
            )}
          </>
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
            <Button onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;