import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, Users, Shield, Headphones } from 'lucide-react';

const Register = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: searchParams.get('role') || '',
    name: '',
    email: '',
    phone: '',
    city: '',
    category: '', // for providers
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (registrationComplete && user) {
      if (user.role === 'provider') {
        navigate('/provider/onboarding');
      } else if (user.role === 'client') {
        navigate('/client/dashboard');
      }
    }
  }, [user, registrationComplete, navigate]);

  const categories = [
    { id: 'companion', name: 'Companion', icon: Users },
    { id: 'bouncer', name: 'Security/Bouncer', icon: Shield },
    { id: 'bodyguard', name: 'Bodyguard', icon: Shield },
    { id: 'assistant', name: 'Personal Assistant', icon: Headphones }
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');

    try {
      const { data, error: signUpError } = await signUp(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        role: formData.role
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data?.user) {
        setRegistrationComplete(true);
      } else {
        setInfo('Account created. Please check your email to confirm before continuing.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Choose Your Role</h2>
              <p className="text-slate-600">Are you looking for services or providing them?</p>
            </div>
            
            <div className="space-y-3">
              <button
                type="button"
                className={`w-full p-4 border-2 rounded-lg transition-all ${
                  formData.role === 'client' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setFormData({...formData, role: 'client'})}
              >
                <div className="text-left">
                  <div className="font-semibold text-slate-900">I'm a Client</div>
                  <div className="text-sm text-slate-600">I want to book professional services</div>
                </div>
              </button>
              
              <button
                type="button"
                className={`w-full p-4 border-2 rounded-lg transition-all ${
                  formData.role === 'provider' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setFormData({...formData, role: 'provider'})}
              >
                <div className="text-left">
                  <div className="font-semibold text-slate-900">I'm a Provider</div>
                  <div className="text-sm text-slate-600">I want to offer professional services</div>
                </div>
              </button>
            </div>

            <Button 
              onClick={handleNext} 
              disabled={!formData.role}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Basic Information</h2>
              <p className="text-slate-600">Tell us about yourself</p>
            </div>

            <div className="space-y-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your full name"
                required
              />
              
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email"
                required
              />
              
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter your phone number"
                required
              />
              
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="Enter your city"
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!formData.name || !formData.email || !formData.phone || !formData.city}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 3:
        if (formData.role === 'provider') {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Service Category</h2>
                <p className="text-slate-600">What type of services do you provide?</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      className={`p-4 border-2 rounded-lg transition-all text-center ${
                        formData.category === category.id 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setFormData({...formData, category: category.id})}
                    >
                      <Icon className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <div className="text-sm font-medium text-slate-900">{category.name}</div>
                    </button>
                  );
                })}
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={!formData.category}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          );
        } else {
          handleNext();
          return null;
        }

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Create Password</h2>
              <p className="text-slate-600">Secure your account</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            {info && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                {info}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Create a strong password"
                required
              />
              
              <Input
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Confirm your password"
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                loading={loading}
                disabled={!formData.password || !formData.confirmPassword}
                className="flex-1"
              >
                Create Account
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">fliQ</div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i <= step ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form */}
        <Card className="p-6">
          {renderStep()}

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;