import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClientDashboard from './pages/client/Dashboard';
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderServices from './pages/provider/Services';
import AdminDashboard from './pages/admin/Dashboard';
import ProviderProfile from './pages/client/ProviderProfile';
import BookingFlow from './pages/client/BookingFlow';
import ProviderOnboarding from './pages/provider/Onboarding';
import { Toaster } from './components/ui/Toaster';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
            <Route path="/provider/services" element={<ProviderServices />} />
            <Route path="/provider/onboarding" element={<ProviderOnboarding />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/provider/:id" element={<ProviderProfile />} />
            <Route path="/book/:providerId" element={<BookingFlow />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;