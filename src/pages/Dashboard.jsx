import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  LayoutDashboard, Utensils, ShoppingBag, Truck, 
  LogOut, Plus, Save, Info, Sparkles, Menu, X 
} from 'lucide-react';
import { MenuTable } from '../components/MenuTable';
import { AddItemModal } from '../components/AddItemModal';

export const Dashboard = ({ onLogout }) => {
  const [stats, setStats] = useState({ cafe: 0, deli: 0, catering: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  
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
    // FIX: Added fixed position and overflow-hidden to root to lock the viewport
    <div className="fixed inset-0 flex bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* MOBILE HEADER - Fixed at top */}
      <div className="lg:hidden fixed top-0 w-full bg-deli-green text-white p-4 flex justify-between items-center z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-deli-gold rounded-lg flex items-center justify-center font-serif font-bold text-deli-green">M</div>
          <span className="font-serif italic text-lg text-white">Console</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* 1. SIDEBAR NAVIGATION */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-deli-green text-white p-6 flex flex-col z-50 shadow-2xl transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:h-screen lg:shrink-0
      `}>
        <div className="hidden lg:flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-deli-gold rounded-xl flex items-center justify-center font-serif font-bold text-xl shadow-lg shadow-black/20 text-deli-green">M</div>
          <div>
            <h2 className="font-serif italic text-xl leading-none text-white">Console</h2>
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-50 font-bold">Mustard Cafe</span>
          </div>
        </div>

        <nav className="space-y-2 flex-1 mt-16 lg:mt-0">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Overview" active onClick={() => setIsSidebarOpen(false)} />
          <NavItem icon={<Utensils size={20}/>} label="Cafe Menu" onClick={() => setIsSidebarOpen(false)} />
          <NavItem icon={<ShoppingBag size={20}/>} label="Deli Goods" onClick={() => setIsSidebarOpen(false)} />
          
          <div className="mt-10 pt-10 border-t border-white/10 hidden lg:block">
            <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4 px-4">Admin Help</h3>
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <HelpItem text="Click 'Edit' on any item to change its price or name." />
                <HelpItem text="Announcements show instantly on the homepage." />
            </div>
          </div>
        </nav>

        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-4 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-auto font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={20} /> Sign Out
        </button>
      </aside>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. MAIN CONTENT AREA */}
      {/* FIX: Added overflow-x-hidden and w-full to the main scroll area */}
      <main className={`flex-1 w-full max-w-full overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-12 pt-24 lg:pt-12 transition-all duration-300 ${isSidebarOpen ? 'scale-[0.98] origin-right' : 'scale-100'}`}>
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 lg:mb-12 gap-6">
          <div className="max-w-full overflow-hidden">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-deli-green italic mb-2">Morning, Mustard!</h1>
            <p className="text-slate-400 text-sm font-light">The website dashboard.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-deli-green text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:shadow-2xl hover:-translate-y-1 transition-all shadow-xl shadow-deli-green/20 flex justify-center items-center gap-2 active:scale-95"
          >
            <Plus size={20} /> Add New Item
          </button>
        </header>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-8 mb-8 lg:mb-12">
          <StatCard title="Cafe" count={stats.cafe} icon={<Utensils className="text-deli-gold" />} color="bg-orange-50" />
          <StatCard title="Deli" count={stats.deli} icon={<ShoppingBag className="text-deli-gold" />} color="bg-blue-50" />
          <StatCard title="Catering" count={stats.catering} icon={<Truck className="text-deli-gold" />} color="bg-green-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          
          {/* THE CONTROL TOWER */}
          <div className="order-first lg:order-last">
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-deli-gold/20 relative overflow-hidden">
              <h3 className="font-serif italic text-2xl text-deli-green mb-1">Header Message</h3>
              <p className="text-slate-400 text-xs mb-6">Top gold bar text.</p>
              <div className="space-y-4">
                <div className="bg-deli-gold text-white p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 shadow-inner">
                  <Sparkles size={14} className="shrink-0 animate-pulse" />
                  <span className="truncate">{announcement || "Type below..."}</span>
                </div>
                <textarea 
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-base focus:border-deli-gold outline-none transition-colors"
                  rows="3"
                  placeholder="Enter shop announcement..."
                />
                <button 
                  onClick={handleSaveAnnouncement}
                  disabled={isSaving}
                  className="w-full py-5 bg-deli-gold text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  {isSaving ? "Saving..." : <><Save size={18} /> Update Now</>}
                </button>
              </div>
            </div>
          </div>

          {/* THE MENU TABLE - Added horizontal scroll containment */}
          <div className="lg:col-span-2 min-w-0 w-full overflow-hidden">
             <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="font-serif italic text-xl lg:text-2xl text-deli-green">Active Menu</h3>
                  <span className="px-2 py-1 bg-green-50 text-[9px] font-bold text-green-600 rounded uppercase tracking-widest">Live</span>
                </div>
                <div className="overflow-x-auto w-full">
                  <MenuTable 
                    key={stats.cafe + stats.deli + stats.catering} 
                    onEdit={handleEdit} 
                  />
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

const NavItem = ({ icon, label, active = false, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-bold text-[11px] lg:text-xs uppercase tracking-widest transition-all ${
    active ? 'bg-white/10 text-deli-gold shadow-inner border-l-4 border-deli-gold' : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`}>
    {icon} {label}
  </button>
);

const StatCard = ({ title, count, icon, color }) => (
  <div className="bg-white p-5 lg:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">{title}</p>
      <p className="text-3xl lg:text-5xl font-serif text-deli-green italic leading-none">{count}</p>
    </div>
    <div className={`p-3 lg:p-5 ${color} rounded-2xl`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
  </div>
);

const HelpItem = ({ text }) => (
  <div className="flex gap-2">
    <div className="mt-1 shrink-0"><Info size={14} className="text-deli-gold" /></div>
    <p className="text-[11px] text-white/50 leading-relaxed italic">{text}</p>
  </div>
);