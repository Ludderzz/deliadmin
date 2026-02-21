import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  LayoutDashboard, Utensils, ShoppingBag, Truck, 
  LogOut, Plus, Save, Info, Sparkles, Menu, X, 
  Upload, Loader2, CheckCircle2, Camera
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

  const [deliContent, setDeliContent] = useState('');
  const [deliImages, setDeliImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingDeli, setIsSavingDeli] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const INFO_ID = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    fetchStats();
    fetchAnnouncement();
    fetchDeliInfo();
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

  const fetchDeliInfo = async () => {
    const { data } = await supabase.from('deli_bottom_info').select('*').single();
    if (data) {
      setDeliContent(data.content);
      setDeliImages(data.image_urls || []);
    }
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveAnnouncement = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'announcement_text', value: announcement });
    
    setIsSaving(false);
    if (!error) triggerSuccess();
  };

  const handleImageUpload = async (e) => {
    if (deliImages.length >= 6) return;
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('deli-gallery')
      .upload(fileName, file);

    if (!uploadError) {
      const { data } = supabase.storage.from('deli-gallery').getPublicUrl(fileName);
      setDeliImages([...deliImages, data.publicUrl]);
    }
    setIsUploading(false);
  };

  const handleSaveDeliInfo = async () => {
    setIsSavingDeli(true);
    const { error } = await supabase
      .from('deli_bottom_info')
      .update({ content: deliContent, image_urls: deliImages })
      .eq('id', INFO_ID);
    
    setIsSavingDeli(false);
    if (!error) triggerSuccess();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="fixed inset-0 flex bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* SUCCESS TOAST */}
      {showSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-deli-green text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={20} className="text-deli-gold" />
          <span className="text-xs font-bold uppercase tracking-widest">Changes Saved Successfully</span>
        </div>
      )}

      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 w-full bg-deli-green text-white p-4 flex justify-between items-center z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-deli-gold rounded-lg flex items-center justify-center font-serif font-bold text-deli-green">M</div>
          <span className="font-serif italic text-lg text-white">Console</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg">
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-deli-green text-white p-6 flex flex-col z-50 transition-transform lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="hidden lg:flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-deli-gold rounded-xl flex items-center justify-center font-serif font-bold text-xl text-deli-green">M</div>
          <h2 className="font-serif italic text-xl text-white">Console</h2>
        </div>
        <nav className="space-y-2 flex-1">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Overview" active />
          <div className="mt-10 pt-10 border-t border-white/10">
            <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4 px-4">Admin Help</h3>
            <div className="bg-white/5 rounded-xl p-4 space-y-3 text-[11px] text-white/50 italic">
               <p>• Max 6 photos for the deli gallery.</p>
               <p>• Use "Takeaway Menu" info for seasonal updates.</p>
            </div>
          </div>
        </nav>
        <button onClick={onLogout} className="flex items-center gap-3 px-4 py-4 text-white/60 hover:text-red-400 font-bold text-xs uppercase tracking-widest">
          <LogOut size={20} /> Sign Out
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 pt-24 lg:pt-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-serif text-deli-green italic mb-2">Morning, Mustard!</h1>
            <p className="text-slate-400 text-sm font-light">Manage your shop content.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-deli-green text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl">
            <Plus size={20} /> Add Menu Item
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-8 mb-12">
          <StatCard title="Cafe" count={stats.cafe} icon={<Utensils />} color="bg-orange-50" />
          <StatCard title="Deli" count={stats.deli} icon={<ShoppingBag />} color="bg-blue-50" />
          <StatCard title="Catering" count={stats.catering} icon={<Truck />} color="bg-green-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          
          <div className="space-y-8">
            {/* ANNOUNCEMENT BOX */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="font-serif italic text-2xl text-deli-green mb-6">Header Message</h3>
              <textarea 
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm mb-4 focus:ring-2 focus:ring-deli-gold outline-none transition-all"
                rows="2"
              />
              <button onClick={handleSaveAnnouncement} disabled={isSaving} className="w-full py-4 bg-deli-gold text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] flex justify-center items-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all">
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Update Header
              </button>
            </div>

            {/* DELI PAGE MANAGER */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <Camera size={18} className="text-deli-mustard" />
                <h3 className="font-serif italic text-2xl text-deli-green">Deli Gallery</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-6">
                {deliImages.map((img, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-slate-100 relative group overflow-hidden border border-slate-100">
                    <img src={img} className="w-full h-full object-cover" alt="Deli" />
                    <button 
                      onClick={() => setDeliImages(deliImages.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <X size={18} strokeWidth={3} />
                    </button>
                  </div>
                ))}
                {deliImages.length < 6 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-deli-mustard hover:bg-deli-mustard/5 transition-all">
                    {isUploading ? (
                      <Loader2 className="animate-spin text-deli-mustard" size={20} />
                    ) : (
                      <>
                        <Plus className="text-slate-300" size={20} />
                        <span className="text-[8px] font-bold uppercase text-slate-400 mt-1">Add</span>
                      </>
                    )}
                    <input type="file" className="hidden" onChange={handleImageUpload} disabled={isUploading} accept="image/*" />
                  </label>
                )}
              </div>

              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Deli Bottom Text</label>
              <textarea 
                value={deliContent}
                onChange={(e) => setDeliContent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm mb-6 focus:ring-2 focus:ring-[#1a2b4b] outline-none transition-all"
                rows="3"
                placeholder="Seasonal info..."
              />
              
              <button 
                onClick={handleSaveDeliInfo} 
                disabled={isSavingDeli || isUploading} 
                className="w-full py-5 bg-[#1a2b4b] text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] flex justify-center items-center gap-2 hover:bg-[#111c31] shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSavingDeli ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> 
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="text-deli-gold" /> 
                    Confirm Deli Changes
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-serif italic text-2xl text-deli-green">Active Menu</h3>
                <span className="px-3 py-1 bg-green-50 text-[10px] font-bold text-green-600 rounded-full uppercase tracking-widest">Live Site</span>
              </div>
              <MenuTable onEdit={handleEdit} />
            </div>
          </div>

        </div>
      </main>

      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={() => {setIsModalOpen(false); setEditingItem(null);}} 
        onRefresh={fetchStats} 
        initialData={editingItem}
      />
    </div>
  );
};

const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
    active ? 'bg-white/10 text-deli-gold border-l-4 border-deli-gold' : 'text-slate-300'
  }`}>
    {icon} {label}
  </div>
);

const StatCard = ({ title, count, icon, color }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">{title}</p>
      <p className="text-5xl font-serif text-deli-green italic leading-none">{count}</p>
    </div>
    <div className={`p-5 ${color} rounded-2xl text-deli-gold`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
  </div>
);