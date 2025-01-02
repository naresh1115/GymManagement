import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/common_components/Sidebar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MembersPage from './pages/MembersPage';
import Dashboard from './pages/Dashboard'; // Updated import
import SettingsPage from './pages/SettingsPage';
import TrainersPage from './pages/TrainersPage';
import PaymentsPage from './pages/PaymentsPage';

const App = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated (e.g., check localStorage for a token)
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
  }, []);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* BACKGROUND SETTINGS */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
      </div>

      {!isAuthPage && isAuthenticated && <Sidebar />}

      <div className="relative z-10 flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/trainers" element={<TrainersPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
