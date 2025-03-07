import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RestaurantProvider } from './contexts/RestaurantContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import RestaurantSettings from './pages/restaurant/Settings';
import RestaurantMembers from './pages/restaurant/Members';
import Allergenie from './pages/features/Allergenie';
import Layout from './components/Layout';
import StaffLayout from './components/StaffLayout';
import AcceptInvitation from './pages/auth/AcceptInvitation';
import UserSettings from './pages/UserSettings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <RestaurantProvider>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/invitation/:token" element={<AcceptInvitation />} />
            
            {/* Staff routes */}
            <Route element={<ProtectedRoute><StaffLayout /></ProtectedRoute>}>
              <Route path="/features/allergenie" element={<Allergenie />} />
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </RestaurantProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;