import React, { useState, useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { LoginPage } from './pages/LoginPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLogin = localStorage.getItem('isDeliAdmin');
    if (savedLogin === 'true') {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    localStorage.setItem('isDeliAdmin', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isDeliAdmin');
    setIsLoggedIn(false);
  };

  if (loading) return null;

  return (
    // 1. Fixed "min-h-screen" ensures the background color always fills the mobile viewport
    // 2. "overflow-x-hidden" prevents accidental side-scrolling on touch devices
    <div className="min-h-screen antialiased text-slate-900 selection:bg-admin-accent selection:text-white overflow-x-hidden bg-admin-bg">
      
      {isLoggedIn ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
      
      {/* MOBILE NOTIFICATION FIX: 
         - On small screens (sm:), it stays bottom-center and spans the width.
         - On desktop (md:), it moves back to the bottom-right.
      */}
      <div 
        id="notifications" 
        className="fixed bottom-0 sm:bottom-4 left-0 sm:left-auto right-0 sm:right-4 z-[999] p-4 sm:p-0 pointer-events-none" 
      />
    </div>
  );
}

export default App;