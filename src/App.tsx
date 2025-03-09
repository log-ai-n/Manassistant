import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RestaurantProvider } from './contexts/RestaurantContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import RestaurantSettings from './pages/restaurant/Settings';
import RestaurantMembers from './pages/restaurant/Members';
import Allergenie from './pages/features/Allergenie';
import Billing from './pages/features/Billing';
import Layout from './components/Layout';
import StaffLayout from './components/StaffLayout';
import AcceptInvitation from './pages/auth/AcceptInvitation';
import UserSettings from './pages/UserSettings';
import { ActivityFeed } from './components/ActivityFeed';
import MemoryTester from './components/MemoryTester';
import Auth0Tester from './components/Auth0Tester';
import SpeedInsightsAdmin from './components/SpeedInsightsAdmin';
import { SpeedInsights } from '@vercel/speed-insights/react';
import LandingPage from './pages/LandingPage';
import MemoryDemonstrator from './components/MemoryDemonstrator';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <RestaurantProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/invitation/:token" element={<AcceptInvitation />} />
            
            {/* Staff routes */}
            <Route element={<ProtectedRoute><StaffLayout /></ProtectedRoute>}>
              <Route path="/features/allergenie" element={<Allergenie />} />
              <Route path="/features/billing" element={<Billing />} />
              <Route path="/test/memories" element={<MemoryTester />} />
              <Route path="/test/auth0" element={<Auth0Tester />} />
              <Route path="/admin/performance" element={<SpeedInsightsAdmin />} />
              <Route path="/demo/memory" element={<MemoryDemonstrator />} />
              {/* Add other feature routes here */}
            </Route>

            {/* Owner/Manager routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<UserSettings />} />
              <Route path="/restaurant/settings" element={<RestaurantSettings />} />
              <Route path="/restaurant/members" element={<RestaurantMembers />} />
            </Route>
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<PrivateRoute><Layout><Routes><Route path="/" element={<Dashboard />} /></Routes></Layout></PrivateRoute>} />
            <Route path="*" element={<PrivateRoute><Layout><Routes><Route path="/" element={<Dashboard />} /></Routes></Layout></PrivateRoute>} />
          </Routes>
          <SpeedInsights />
        </RestaurantProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;