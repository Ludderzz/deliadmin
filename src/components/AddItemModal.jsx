import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Plus, Percent, Save, Users, Info, MapPin, ChevronRight } from 'lucide-react';

export const AddItemModal = ({ isOpen, onClose, onRefresh, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [isDeal, setIsDeal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    deal_price: '',
    description: '',
    ingredients: '',
    section: 'cafe',
    category: '',
    tags: [],
    image_url: '',
  });

  const isCatering = formData.section === 'catering';

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price || '',
        deal_price: initialData.deal_price || '',
        description: initialData.description || '',
        ingredients: initialData.ingredients || '',
        section: initialData.section || 'cafe',
        category: initialData.category || '',
        tags: initialData.tags ? initialData.tags.split(', ') : [],
        image_url: initialData.image_url || '',
      });
      setIsDeal(initialData.is_deal || false);
    } else if (!initialData && isOpen) {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFormData({ name: '', price: '', deal_price: '', description: '', ingredients: '', section: 'cafe', category: '', tags: [], image_url: '' });
    setIsDeal(false);
  };

  const dietaryOptions = ['VG', 'GF', 'DF', 'V', 'Nuts'];

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const itemPayload = {
        ...formData,
        tags: formData.tags.join(', '),
        is_deal: isCatering ? false : isDeal, 
      };

      if (initialData?.id) {
        const { error } = await supabase.from('menu_items').update(itemPayload).eq('id', initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('menu_items').insert([itemPayload]);
        if (error) throw error;
      }
      onRefresh();
      onClose();
      resetForm();
    } catch (err) {
      alert("Error saving: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex justify-end overflow-hidden font-sans">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#465d6a]/60 backdrop-blur-sm transition-opacity touch-none" 
        onClick={onClose} 
      />
      
      {/* Drawer Container */}
      <div className="relative w-full md:w-[450px] bg-[#f8f9fa] h-[100dvh] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-[#465d6a]/20">
        
        {/* Header - Using Deli Green */}
        <div className="flex justify-between items-center p-6 bg-[#465d6a] shrink-0">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c8a011] mb-1">Deli Inventory</p>
            <h2 className="text-2xl font-serif text-[#f0ede6] italic">
              {initialData ? 'Edit Provision' : 'New Listing'}
            </h2>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 text-[#f0ede6] rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>
        
        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
          
          {/* SECTION SELECTOR - High Visibility */}
          <div className="p-4 bg-[#f0ede6] rounded-2xl border-2 border-[#465d6a]/10 shadow-sm flex items-center gap-4">
             <div className="flex-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#465d6a]/60 block mb-1">Section</label>
               <div className="relative">
                 <select 
                    className="w-full bg-transparent text-[#465d6a] font-bold text-lg outline-none appearance-none cursor-pointer pr-8" 
                    value={formData.section} 
                    onChange={e => setFormData({...formData, section: e.target.value})}
                  >
                    <option value="cafe">Café Menu</option>
                    <option value="deli">Deli Retail</option>
                    <option value="catering">Catering Package</option>
                  </select>
                  <ChevronRight size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#c8a011] rotate-90" />
               </div>
             </div>
          </div>

          <div className="space-y-6">
            {/* NAME */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#465d6a] block mb-2">Item Name</label>
              <input 
                required 
                type="text" 
                className="w-full bg-white border-2 border-[#465d6a]/20 rounded-xl p-4 text-base focus:border-[#c8a011] outline-none transition-all shadow-sm" 
                placeholder="Name of the dish/item" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>

            {/* PRICE */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#465d6a] block mb-2">Regular Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#465d6a] font-bold">£</span>
                <input 
                  required 
                  type="text" 
                  className="w-full bg-white border-2 border-[#465d6a]/20 rounded-xl p-4 pl-8 text-base focus:border-[#c8a011] outline-none transition-all shadow-sm" 
                  placeholder="0.00" 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#465d6a] block mb-2">Menu Description</label>
              <textarea 
                className="w-full bg-white border-2 border-[#465d6a]/20 rounded-xl p-4 text-sm focus:border-[#c8a011] outline-none h-24 resize-none shadow-sm italic" 
                placeholder="Brief description for customers..." 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>

            {/* PROVENANCE */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#465d6a] block mb-2 flex items-center gap-2">
                <MapPin size={12} className="text-[#c8a011]" /> Provenance / Ingredients
              </label>
              <input 
                type="text"
                className="w-full bg-white border-2 border-[#465d6a]/20 rounded-xl p-4 text-sm focus:border-[#c8a011] outline-none shadow-sm" 
                placeholder="e.g. Somerset Farmed" 
                value={formData.ingredients} 
                onChange={e => setFormData({...formData, ingredients: e.target.value})} 
              />
            </div>
          </div>

          {/* DEAL TOGGLE - The "Gold" Section */}
          {!isCatering && (
            <div className={`p-5 rounded-2xl border-2 transition-all ${isDeal ? 'border-[#c8a011] bg-[#c8a011]/5 shadow-inner' : 'border-[#465d6a]/10 bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDeal ? 'bg-[#c8a011] text-white' : 'bg-[#f0ede6] text-[#465d6a]'}`}>
                    <Percent size={16} />
                  </div>
                  <span className="text-xs font-black text-[#465d6a] uppercase tracking-widest">Mark as Daily Deal</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsDeal(!isDeal)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${isDeal ? 'bg-[#c8a011]' : 'bg-[#465d6a]/20'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDeal ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              {isDeal && (
                <input 
                  type="text" 
                  className="w-full bg-white border-2 border-[#c8a011] rounded-xl p-4 text-base outline-none animate-in fade-in" 
                  placeholder="Deal Price £" 
                  value={formData.deal_price} 
                  onChange={e => setFormData({...formData, deal_price: e.target.value})} 
                />
              )}
            </div>
          )}

          {/* DIETARY TAGS - Accent button style */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[#465d6a] block mb-3">Dietary Info</label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map(tag => (
                <button 
                  key={tag} 
                  type="button" 
                  onClick={() => handleTagToggle(tag)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black border-2 transition-all active:scale-95 ${
                    formData.tags.includes(tag) 
                    ? 'bg-[#465d6a] text-[#f0ede6] border-[#465d6a] shadow-md' 
                    : 'bg-white text-[#465d6a]/40 border-[#465d6a]/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Action Footer - Gold Button with solid shadow for visibility */}
        <div className="p-6 bg-[#f0ede6] border-t border-[#465d6a]/10 shrink-0">
          <button 
            disabled={loading} 
            onClick={handleSubmit}
            className="w-full bg-[#c8a011] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 shadow-[0_4px_0_#a6850e]"
          >
            {loading ? 'Saving...' : (
              <>{initialData ? <Save size={18}/> : <Plus size={18}/>} {initialData ? 'Update Inventory' : 'Publish Listing'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};