import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  LayoutDashboard, Utensils, ShoppingBag, Truck, 
  Upload, LogOut, Settings, Plus, Megaphone, Save, Info, Sparkles, Menu, X 
} from 'lucide-react';
import { CSVUploader } from '../components/CSVUploader';
import { MenuTable } from '../components/MenuTable';
import { AddItemModal } from '../components/AddItemModal';

// Accept onLogout prop from App.jsx
export const Dashboard = ({ onLogout }) => {
  const [stats, setStats] = useState({ cafe: 0, deli: 0, catering: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  
  const [announcement, setAnnouncement] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchAnnouncement();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.from('menu_items').select('section');
      if (error) throw error;
      const counts = data.reduce((acc, item) => {
        const sec = (item.section || 'cafe').toLowerCase();
        acc[sec] = (acc[sec] || 0) + 1;
        return acc;
      }, { cafe: 0, deli: 0, catering: 0 });
      setStats(counts);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchAnnouncement = async () => {
    const { data } = await supabase.from('settings').select('value').eq('key', 'announcement_text').single();
    if (data) setAnnouncement(data.value);
  };

  const handleSaveAnnouncement = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'announcement_text', value: announcement });
    
    setTimeout(() => setIsSaving(false), 1000);
    if (error) alert("Could not save. Check internet connection.");
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      
      {/* MOBILE HEADER - Only visible on small screens */}
      <div className="lg:hidden fixed top-0 w-full bg-deli-green text-white p-4 flex justify-between items-center z-30 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-deli-gold rounded-lg flex items-center justify-center font-serif font-bold text-deli-green">M</div>
          <span className="font-serif italic text-lg text-white">Console</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 1. SIDEBAR NAVIGATION */}
      <aside className={`
        w-72 bg-deli-green text-white p-6 flex flex-col fixed h-full shadow-2xl z-40 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0
      `}>
        <div className="hidden lg:flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-deli-gold rounded-xl flex items-center justify-center font-serif font-bold text-xl shadow-lg shadow-black/20 text-deli-green">M</div>
          <div>
            <h2 className="font-serif italic text-xl leading-none text-white">Console</h2>
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-50 font-bold">Mustard Cafe</span>
          </div>
        </div>

        <nav className="space-y-2 flex-1 mt-12 lg:mt-0">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Overview" active onClick={() => setIsSidebarOpen(false)} />
          <NavItem icon={<Utensils size={18}/>} label="Cafe Menu" onClick={() => setIsSidebarOpen(false)} />
          <NavItem icon={<ShoppingBag size={18}/>} label="Deli Goods" onClick={() => setIsSidebarOpen(false)} />
          
          <div className="mt-10 pt-10 border-t border-white/10 hidden lg:block">
            <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4 px-4">Admin Help</h3>
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <HelpItem text="Click 'Edit' on any item to change its price or name." />
                <HelpItem text="Announcements show instantly on the homepage." />
            </div>
          </div>
        </nav>

        {/* LOGOUT BUTTON - Now Functional */}
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-auto font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. MAIN CONTENT AREA */}
      <main className={`flex-1 transition-all duration-300 p-6 lg:p-12 pt-24 lg:pt-12 ${isSidebarOpen ? 'blur-sm lg:blur-none' : ''} lg:ml-72`}>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-3xl lg:text-5xl font-serif text-deli-green italic mb-2">Morning, Mustard!</h1>
            <p className="text-slate-400 text-sm font-light">The website dashboard.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-deli-green text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-deli-green/20 flex justify-center items-center gap-2"
          >
            <Plus size={20} /> Add New Item
          </button>
        </header>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-8 mb-12">
          <StatCard title="Cafe" count={stats.cafe} icon={<Utensils className="text-deli-gold" />} color="bg-orange-50" />
          <StatCard title="Deli" count={stats.deli} icon={<ShoppingBag className="text-deli-gold" />} color="bg-blue-50" />
          <StatCard title="Catering" count={stats.catering} icon={<Truck className="text-deli-gold" />} color="bg-green-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* THE MENU TABLE */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-4 lg:p-8 shadow-sm border border-slate-100 overflow-x-auto">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-serif italic text-xl lg:text-2xl text-deli-green whitespace-nowrap">Active Menu</h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live</span>
             </div>
             <MenuTable 
               key={stats.cafe + stats.deli + stats.catering} 
               onEdit={handleEdit} 
             />
          </div>

          {/* THE CONTROL TOWER */}
          <div className="space-y-8 order-first lg:order-last">
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-deli-gold/20 relative overflow-hidden">
              <h3 className="font-serif italic text-2xl text-deli-green mb-1 flex items-center gap-2">Header Message</h3>
              <p className="text-slate-400 text-xs mb-6">Top gold bar text.</p>
              <div className="space-y-4">
                <div className="bg-deli-gold text-white p-3 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-inner">
                  <Sparkles size={12} className="shrink-0 animate-pulse" />
                  <span className="truncate">{announcement || "Type below..."}</span>
                </div>
                <textarea 
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-sm focus:border-deli-gold outline-none"
                  rows="3"
                />
                <button 
                  onClick={handleSaveAnnouncement}
                  disabled={isSaving}
                  className="w-full py-4 bg-deli-gold text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  {isSaving ? "Saving..." : <><Save size={16} /> Update Now</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AddItemModal 
        isOpen={isModalOpen} onClose={() => {setIsModalOpen(false); setEditingItem(null);}} 
        onRefresh={fetchStats} initialData={editingItem}
      />
    </div>
  );
};

// NavItem Helper
const NavItem = ({ icon, label, active = false, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
    active ? 'bg-white/10 text-deli-gold shadow-inner border-l-4 border-deli-gold' : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`}>
    {icon} {label}
  </button>
);

// HelpItem Helper
const HelpItem = ({ text }) => (
  <div className="flex gap-2">
    <div className="mt-1 shrink-0"><Info size={12} className="text-deli-gold" /></div>
    <p className="text-[10px] text-white/50 leading-relaxed italic">{text}</p>
  </div>
);

// StatCard Helper
const StatCard = ({ title, count, icon, color }) => (
  <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-[9px] lg:text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 lg:mb-2">{title}</p>
      <p className="text-3xl lg:text-5xl font-serif text-deli-green italic leading-none">{count}</p>
    </div>
    <div className={`p-4 lg:p-5 ${color} rounded-2xl`}>
      {icon}
    </div>
  </div>
);