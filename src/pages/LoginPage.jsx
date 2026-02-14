import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Adjust path to your file

export const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Directly query the Supabase table
    const { data, error: dbError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password) // Simple match
      .single();

    if (data) {
      onLoginSuccess(); // Let them in
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-admin-bg">
      <form onSubmit={handleLogin} className="admin-card w-full max-w-md">
        <h2 className="mb-6 text-center text-2xl font-serif text-admin-accent">Admin Login</h2>
        
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Username" 
            className="admin-input"
            onChange={(e) => setUsername(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="admin-input"
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>

        {error && <p className="mt-4 text-center text-sm text-red-500 font-bold">{error}</p>}

        <button className="admin-btn-primary mt-6 w-full">
          Enter Dashboard
        </button>
      </form>
    </div>
  );
};