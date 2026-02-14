import React, { useState, useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { LoginPage } from './pages/LoginPage';

function App() {
  // 1. Check if the user was already logged in (saved in browser memory)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLogin = localStorage.getItem('isDeliAdmin');
    if (savedLogin === 'true') {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  // 2. Function to call when login is successful
  const handleLoginSuccess = () => {
    localStorage.setItem('isDeliAdmin', 'true');
    setIsLoggedIn(true);
  };

  // 3. Optional: Function to logout
  const handleLogout = () => {
    localStorage.removeItem('isDeliAdmin');
    setIsLoggedIn(false);
  };

  if (loading) return null; // Prevent flicker while checking login

  return (
    <div className="antialiased text-slate-900 selection:bg-admin-accent selection:text-white">
      {isLoggedIn ? (
        /* Only show Dashboard if logged in */
        <Dashboard onLogout={handleLogout} />
      ) : (
        /* Show Login Page if NOT logged in */
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
      
      {/* Toast Notification Container */}
      <div id="notifications" className="fixed bottom-4 right-4 z-50" />
    </div>
  );
}

export default App;