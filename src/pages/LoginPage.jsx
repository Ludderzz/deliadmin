import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Lock, User, ChevronRight } from 'lucide-react';

export const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: dbError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (data) {
      onLoginSuccess();
    } else {
      setError("Invalid username or password");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Logo / Branding Area */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-admin-accent text-white shadow-lg mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-serif italic text-admin-accent">Console Login</h2>
          <p className="text-slate-400 text-sm mt-2 font-light">Mustard Cafe Admin Access</p>
        </div>

        <form 
          onSubmit={handleLogin} 
          className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all"
        >
          <div className="space-y-5">
            {/* Username Field */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                <User size={18} />
              </div>
              <input 
                required
                type="text" 
                placeholder="Username" 
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl py-4 pl-12 pr-4 text-base focus:border-admin-primary focus:bg-white outline-none transition-all placeholder:text-slate-300"
                onChange={(e) => setUsername(e.target.value)} 
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                <Lock size={18} />
              </div>
              <input 
                required
                type="password" 
                placeholder="Password" 
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl py-4 pl-12 pr-4 text-base focus:border-admin-primary focus:bg-white outline-none transition-all placeholder:text-slate-300"
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-center text-sm text-red-500 font-bold animate-in fade-in zoom-in duration-200">
              {error}
            </div>
          )}

          <button 
            disabled={loading}
            className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-admin-primary py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-admin-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : (
              <>
                Enter Dashboard <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-slate-300 font-bold">
          Authorized Personnel Only
        </p>
      </div>
    </div>
  );
};