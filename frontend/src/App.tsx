import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import React from 'react';
import './App.css';

// Import page components
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AcceptInvite from './pages/AcceptInvite';
import Users from './pages/Users';
import Profile from './pages/Profile';
import SetupMFA from './pages/SetupMFA';
import VerifyMFA from './pages/VerifyMFA';
import NotificationPreferences from './pages/NotificationPreferences';
import TermsOfService from './pages/TermsOfService';
import CompanySettings from './pages/CompanySettings';
import ActivityLogs from './pages/ActivityLogs';
import OnboardingTutorial from './pages/OnboardingTutorial';
import PropertyListings from './pages/PropertyListings';
import WealthMapDashboard from './pages/WealthMapDashboard';
// import InviteUser from './pages/InviteUser';

// Import layout and auth components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import InviteForm from './components/invite/InviteForm';
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/verify-mfa" element={<VerifyMFA />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          
          {/* Protected routes - using the Outlet pattern */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/invite" element={<InviteForm />} />
              <Route path="/users" element={<Users />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/setup-mfa" element={<SetupMFA />} />
              <Route path="/notifications" element={<NotificationPreferences />} />
              <Route path="/company-settings" element={<CompanySettings />} />
              <Route path="/activity-logs" element={<ActivityLogs />} />
              <Route path="/onboarding" element={<OnboardingTutorial />} />
              <Route path="/property-listings" element={<PropertyListings />} />
              <Route path="/wealth-map" element={<WealthMapDashboard />} />
            </Route>
          </Route>
          
          {/* Redirect to login if no route matches */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
