import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  LayoutDashboard, Utensils, ShoppingBag, Truck, 
  LogOut, Plus, Save, Info, Sparkles, Menu, X, 
  Upload, Loader2, CheckCircle2, Camera, Store, CookingPot // Replaced BreadSlice/Bread
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

  const [deliData, setDeliData] = useState({
    content: '',
    image_urls: [],
    bread_content: '',
    bread_image_urls: []
  });
  
  const [uploadingType, setUploadingType] = useState(null);
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
      const { data } = await supabase.from('menu_items').select('section');
      const counts = data?.reduce((acc, item) => {
        const sec = (item.section || 'cafe').toLowerCase();
        acc[sec] = (acc[sec] || 0) + 1;
        return acc;
      }, { cafe: 0, deli: 0, catering: 0 });
      setStats(counts || { cafe: 0, deli: 0, catering: 0 });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchAnnouncement = async () => {
    const { data } = await supabase.from('settings').select('value').eq('key', 'announcement_text').single();
    if (data) setAnnouncement(data.value);
  };

  const fetchDeliInfo = async () => {
    const { data } = await supabase.from('deli_bottom_info').select('*').eq('id', INFO_ID).single();
    if (data) {
      setDeliData({
        content: data.content || '',
        image_urls: data.image_urls || [],
        bread_content: data.bread_content || '',
        bread_image_urls: data.bread_image_urls || []
      });
    }
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveAnnouncement = async () => {
    setIsSaving(true);
    await supabase.from('settings').upsert({ key: 'announcement_text', value: announcement });
    setIsSaving(false);
    triggerSuccess();
  };

  const handleImageUpload = async (e, type) => {
    const currentImages = type === 'bread' ? deliData.bread_image_urls : deliData.image_urls;
    if (currentImages.length >= 6) return;

    const file = e.target.files[0];
    if (!file) return;

    setUploadingType(type);
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('deli-gallery').upload(fileName, file);

    if (!uploadError) {
      const { data } = supabase.storage.from('deli-gallery').getPublicUrl(fileName);
      const key = type === 'bread' ? 'bread_image_urls' : 'image_urls';
      setDeliData(prev => ({ ...prev, [key]: [...prev[key], data.publicUrl] }));
    }
    setUploadingType(null);
  };

  const handleSaveDeliInfo = async () => {
    setIsSavingDeli(true);
    const { error } = await supabase
      .from('deli_bottom_info')
      .update({ 
        content: deliData.content, 
        image_urls: deliData.image_urls,
        bread_content: deliData.bread_content,
        bread_image_urls: deliData.bread_image_urls 
      })
      .eq('id', INFO_ID);
    
    setIsSavingDeli(false);
    if (!error) triggerSuccess();
  };

  return (
    <div className="fixed inset-0 flex bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      
      {showSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
          <CheckCircle2 size={20} className="text-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Site Updated</span>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-[#1a2b4b] text-white p-6 flex flex-col z-50 transition-transform lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center font-bold text-xl text-[#1a2b4b]">M</div>
          <h2 className="font-serif italic text-xl">Console</h2>
        </div>
        <nav className="space-y-2 flex-1">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active />
          <div className="mt-10 p-6 bg-white/5 rounded-[2rem] border border-white/10">
            <h3 className="text-[10px] uppercase tracking-widest text-amber-400 font-black mb-3">Quick Tips</h3>
            <p className="text-[11px] text-white/50 leading-relaxed italic">Upload bread photos to the Artisan section to separate them from the general deli larder.</p>
          </div>
        </nav>
        <button onClick={onLogout} className="flex items-center gap-3 px-4 py-4 text-white/40 hover:text-red-400 font-bold text-[10px] uppercase tracking-widest transition-colors">
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 pt-24 lg:pt-12 scroll-smooth">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-serif text-[#1a2b4b] italic mb-2">Morning, Mustard!</h1>
            <p className="text-slate-400 text-sm">Everything is looking good today.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#1a2b4b] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl hover:bg-slate-800 transition-all active:scale-95">
            <Plus size={18} /> Add Menu Item
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <StatCard title="Cafe" count={stats.cafe} icon={<Utensils />} color="bg-orange-50" />
          <StatCard title="Deli" count={stats.deli} icon={<ShoppingBag />} color="bg-blue-50" />
          <StatCard title="Catering" count={stats.catering} icon={<Truck />} color="bg-green-50" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-20">
          
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="font-serif italic text-2xl text-[#1a2b4b] mb-6">Banner Message</h3>
              <textarea 
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-2xl p-5 text-sm mb-4 focus:ring-2 focus:ring-amber-400 outline-none h-24"
              />
              <button onClick={handleSaveAnnouncement} disabled={isSaving} className="w-full py-4 bg-amber-400 text-[#1a2b4b] rounded-2xl font-black uppercase tracking-widest text-[10px] flex justify-center items-center gap-2 hover:brightness-105 transition-all">
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Banner
              </button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <Store size={20} className="text-amber-500" /> {/* Fixed Icon */}
                <h3 className="font-serif italic text-2xl text-[#1a2b4b]">Artisan Bread</h3>
              </div>
              
              <GalleryGrid 
                images={deliData.bread_image_urls} 
                onRemove={(idx) => setDeliData(prev => ({ ...prev, bread_image_urls: prev.bread_image_urls.filter((_, i) => i !== idx) }))}
                onUpload={(e) => handleImageUpload(e, 'bread')}
                uploading={uploadingType === 'bread'}
              />

              <textarea 
                value={deliData.bread_content}
                onChange={(e) => setDeliData(prev => ({...prev, bread_content: e.target.value}))}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm mb-6 focus:ring-2 focus:ring-[#1a2b4b] outline-none h-24"
                placeholder="Bread info..."
              />

              <div className="flex items-center gap-3 mb-6 pt-4 border-t border-slate-50">
                <CookingPot size={20} className="text-blue-500" /> {/* Fixed Icon */}
                <h3 className="font-serif italic text-2xl text-[#1a2b4b]">Seasonal Larder</h3>
              </div>

              <GalleryGrid 
                images={deliData.image_urls} 
                onRemove={(idx) => setDeliData(prev => ({ ...prev, image_urls: prev.image_urls.filter((_, i) => i !== idx) }))}
                onUpload={(e) => handleImageUpload(e, 'general')}
                uploading={uploadingType === 'general'}
              />

              <textarea 
                value={deliData.content}
                onChange={(e) => setDeliData(prev => ({...prev, content: e.target.value}))}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm mb-6 focus:ring-2 focus:ring-[#1a2b4b] outline-none h-24"
                placeholder="General larder info..."
              />
              
              <button 
                onClick={handleSaveDeliInfo} 
                disabled={isSavingDeli || uploadingType} 
                className="w-full py-5 bg-[#1a2b4b] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex justify-center items-center gap-3 hover:bg-slate-800 shadow-xl transition-all disabled:opacity-50"
              >
                {isSavingDeli ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} className="text-amber-400" />}
                Publish All Deli Changes
              </button>
            </div>
          </div>

          <div className="xl:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                    <h3 className="font-serif italic text-2xl text-[#1a2b4b]">Active Menu Items</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Live Database</p>
                </div>
                <span className="px-4 py-1.5 bg-emerald-50 text-[10px] font-black text-emerald-600 rounded-full uppercase tracking-widest border border-emerald-100">Synchronized</span>
              </div>
              <MenuTable onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }} />
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

const GalleryGrid = ({ images, onRemove, onUpload, uploading }) => (
  <div className="grid grid-cols-3 gap-2 mb-4">
    {images.map((img, i) => (
      <div key={i} className="aspect-square rounded-xl bg-slate-100 relative group overflow-hidden border border-slate-200 shadow-sm">
        <img src={img} className="w-full h-full object-cover" alt="Gallery" />
        <button onClick={() => onRemove(i)} className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
          <X size={18} strokeWidth={3} />
        </button>
      </div>
    ))}
    {images.length < 6 && (
      <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all">
        {uploading ? <Loader2 className="animate-spin text-amber-500" size={20} /> : <Plus className="text-slate-300" size={20} />}
        <input type="file" className="hidden" onChange={onUpload} accept="image/*" />
      </label>
    )}
  </div>
);

const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer ${
    active ? 'bg-white/10 text-amber-400 border-l-4 border-amber-400' : 'text-white/40 hover:text-white'
  }`}>
    {icon} {label}
  </div>
);

const StatCard = ({ title, count, icon, color }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">{title}</p>
      <p className="text-5xl font-serif text-[#1a2b4b] italic leading-none">{count}</p>
    </div>
    <div className={`p-5 ${color} rounded-2xl text-amber-500 shadow-inner`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
  </div>
);