import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Shield, Clock, Star, MapPin, Users, Headphones } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user) {
      if (user.role === 'provider') {
        if (user.hasCompletedOnboarding) {
          navigate('/provider/dashboard', { replace: true });
        } else {
          navigate('/provider/onboarding', { replace: true });
        }
      } else if (user.role === 'client') {
        navigate('/client/dashboard', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const services = [
    {
      title: 'Professional Companions',
      description: 'Verified companions for events, dinners, and social occasions',
      icon: Users,
      color: 'bg-[#5d866c]'
    },
    {
      title: 'Security & Bouncers',
      description: 'Professional security personnel for events and venues',
      icon: Shield,
      color: 'bg-[#d9a633]'
    },
    {
      title: 'Personal Bodyguards',
      description: 'Trained personal protection specialists',
      icon: Shield,
      color: 'bg-[#5d866c]'
    },
    {
      title: 'Personal Assistants',
      description: 'Professional assistants for business and personal tasks',
      icon: Headphones,
      color: 'bg-[#d9a633]'
    }
  ];

  const features = [
    {
      title: 'Verified Professionals',
      description: 'All service providers are thoroughly vetted and verified',
      icon: Shield
    },
    {
      title: 'Real-time Tracking',
      description: 'Track your provider in real-time with live location updates',
      icon: MapPin
    },
    {
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your needs',
      icon: Clock
    },
    {
      title: 'Top Rated Service',
      description: 'Consistently high ratings from satisfied clients',
      icon: Star
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/fliQ_logo.png" alt="fliQ" className="h-8" />
            </div>
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button 
                variant="primary" 
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-[#5d866c] text-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Professional Services
              <span className="block text-[#d9a633]">On-Demand</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Connect with verified companions, security professionals, bodyguards, and personal assistants instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/register?role=client')}
                className="text-lg px-8 py-4"
              >
                Find a Professional
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/register?role=provider')}
                className="text-lg px-8 py-4 bg-white/10 border-white text-white hover:bg-white hover:text-[#5d866c]"
              >
                Become a Provider
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Professional Services Available
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose from our range of verified professional service providers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="p-6 text-center hover:shadow-xl transition-all duration-300">
                  <div className={`w-16 h-16 ${service.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-slate-600">
                    {service.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Choose fliQ?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We ensure safety, quality, and reliability in every interaction
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-[#5d866c] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-white/80">
            Join thousands of satisfied clients and professional providers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="primary"
              onClick={() => navigate('/register?role=client')}
              className="text-lg px-8 py-4 bg-[#5d866c] hover:bg-[#4d7159]"
            >
              Start Booking Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/register?role=provider')}
              className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-slate-900"
            >
              Apply as Provider
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img src="/fliQ_logo.png" alt="fliQ" className="h-12 mx-auto mb-4" />
            <p className="text-slate-400 mb-8">
              Professional services on-demand. Safe, verified, reliable.
            </p>
            <div className="border-t border-slate-700 pt-8">
              <p className="text-slate-500">
                © 2025 fliQ. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;