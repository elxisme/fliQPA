import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';
import { Upload, CheckCircle } from 'lucide-react';

const ProviderOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    bio: '',
    basePrice: '',
    profilePhoto: null as File | null,
    documents: [] as File[]
  });

  const categories = [
    { id: 'companion', name: 'Professional Companion' },
    { id: 'bouncer', name: 'Security/Bouncer' },
    { id: 'bodyguard', name: 'Personal Bodyguard' },
    { id: 'assistant', name: 'Personal Assistant' }
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create provider profile
      const { error: providerError } = await supabase
        .from('providers')
        .insert([{
          user_id: user?.id,
          category: formData.category,
          bio: formData.bio
        }]);

      if (providerError) throw providerError;

      // Update user base price
      const { error: userError } = await supabase
        .from('users')
        .update({ profile_base_price: parseFloat(formData.basePrice) })
        .eq('id', user?.id);

      if (userError) throw userError;

      navigate('/provider/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Choose Your Category</h2>
              <p className="text-slate-600">Select the type of services you'll provide</p>
            </div>
            
            <div className="space-y-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                    formData.category === category.id 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setFormData({...formData, category: category.id})}
                >
                  <div className="font-semibold text-slate-900">{category.name}</div>
                </button>
              ))}
            </div>

            <Button 
              onClick={handleNext} 
              disabled={!formData.category}
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
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Tell Us About Yourself</h2>
              <p className="text-slate-600">Help clients understand your experience and expertise</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Professional Bio
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={6}
                  placeholder="Describe your experience, skills, and what makes you unique as a professional..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  required
                />
              </div>
              
              <Input
                label="Base Hourly Rate (₦)"
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                placeholder="e.g., 5000"
                helperText="This will be your default rate if you don't create specific services"
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!formData.bio || !formData.basePrice}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Upload Your Documents</h2>
              <p className="text-slate-600">Upload your profile photo and verification documents</p>
            </div>

            <div className="space-y-6">
              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Profile Photo
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-slate-500">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFormData({...formData, profilePhoto: e.target.files[0]});
                      }
                    }}
                  />
                </div>
                {formData.profilePhoto && (
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {formData.profilePhoto.name}
                  </p>
                )}
              </div>

              {/* Verification Documents */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Verification Documents
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-2">Upload ID, certificates, or references</p>
                  <p className="text-sm text-slate-500">Multiple files allowed</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setFormData({
                          ...formData, 
                          documents: Array.from(e.target.files)
                        });
                      }
                    }}
                  />
                </div>
                {formData.documents.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.documents.map((file, index) => (
                      <p key={index} className="text-sm text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {file.name}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Almost There!</h2>
              <p className="text-slate-600">
                Review your information and complete your profile setup
              </p>
            </div>

            <Card className="p-6 text-left">
              <h3 className="font-semibold text-slate-900 mb-4">Profile Summary</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Category:</span>{' '}
                  {categories.find(c => c.id === formData.category)?.name}
                </div>
                <div>
                  <span className="font-medium text-slate-700">Base Rate:</span>{' '}
                  ₦{formData.basePrice}/hour
                </div>
                <div>
                  <span className="font-medium text-slate-700">Bio:</span>{' '}
                  {formData.bio.substring(0, 100)}...
                </div>
                <div>
                  <span className="font-medium text-slate-700">Documents:</span>{' '}
                  {formData.profilePhoto ? '✓ Profile photo' : '✗ No profile photo'}{' '}
                  {formData.documents.length > 0 && `+ ${formData.documents.length} verification docs`}
                </div>
              </div>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                🎉 Your profile will be reviewed within 24-48 hours. 
                You'll receive an email once you're approved to start receiving bookings!
              </p>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                loading={loading}
                className="flex-1"
              >
                Complete Setup
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">fliQ</div>
          <h1 className="text-2xl font-bold text-slate-900">Provider Onboarding</h1>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i <= step ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-600 mt-2">Step {step} of 4</p>
        </div>

        {/* Form */}
        <Card className="p-8">
          {renderStep()}
        </Card>
      </div>
    </div>
  );
};

export default ProviderOnboarding;