import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Plus, Percent, Save, MapPin, ChevronRight, LayoutGrid, Hash } from 'lucide-react';

export const AddItemModal = ({ isOpen, onClose, onRefresh, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [isDeal, setIsDeal] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    deal_price: '',
    description: '',
    ingredients: '',
    section: 'cafe',
    category: 'Breakfast',
    sort_order: '999',
    number_items: '1', 
    tags: '', 
    image_url: '',
  });

  // Helper variables for logic
  const isCatering = formData.section === 'catering';
  const isCafe = formData.section === 'cafe';

  const cafeCategories = ['Breakfast', 'Lunch', 'Takeaway', 'Children\'s Menu', 'Hot Drinks', 'Cold Drinks'];
  const cateringCategories = ['Set Menus', 'Party Platters', 'Canapés'];

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
        sort_order: initialData.sort_order || '999',
        number_items: initialData.number_items?.toString() || '1', 
        tags: initialData.tags || '',
        image_url: initialData.image_url || '',
      });
      setIsDeal(initialData.is_deal || false);
      
      const allPresets = [...cafeCategories, ...cateringCategories];
      if (initialData.category && !allPresets.includes(initialData.category)) {
        setShowCustomCategory(true);
      }
    } else if (!initialData && isOpen) {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFormData({ 
      name: '', price: '', deal_price: '', description: '', ingredients: '', 
      section: 'cafe', category: 'Breakfast', sort_order: '999', 
      number_items: '1', tags: '', image_url: '' 
    });
    setIsDeal(false);
    setShowCustomCategory(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const itemPayload = {
        ...formData,
        sort_order: parseInt(formData.sort_order) || 999,
        number_items: parseInt(formData.number_items) || 1, 
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
      <div className="absolute inset-0 bg-[#465d6a]/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full md:w-[450px] bg-[#f8f9fa] h-[100dvh] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 md:border-l border-[#465d6a]/20">
        
        <div className="flex justify-between items-center p-5 md:p-6 bg-[#465d6a] shrink-0">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c8a011] mb-1">Deli Inventory</p>
            <h2 className="text-xl md:text-2xl font-serif text-[#f0ede6] italic">{initialData ? 'Edit Provision' : 'New Listing'}</h2>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 text-[#f0ede6] rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} id="itemForm" className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 md:space-y-8 pb-32">
          
          <div className="space-y-4">
            <div className="p-4 bg-[#f0ede6] rounded-2xl border-2 border-[#465d6a]/10 shadow-sm">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#465d6a]/60 block mb-1">Main Section</label>
              <div className="relative">
                <select className="w-full bg-transparent text-[#465d6a] font-bold text-lg outline-none appearance-none cursor-pointer pr-8" 
                  value={formData.section} 
                  onChange={e => {
                    const section = e.target.value;
                    setFormData({
                      ...formData, 
                      section, 
                      category: section === 'catering' ? 'Set Menus' : 'Breakfast'
                    });
                  }}
                >
                  <option value="cafe">Café Menu</option>
                  <option value="catering">Catering Service</option>
                  <option value="deli">Deli Retail</option>
                </select>
                <ChevronRight size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#c8a011] rotate-90 pointer-events-none" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-[#465d6a]/10 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#465d6a] flex items-center gap-2">
                  <LayoutGrid size={12} className="text-[#c8a011]" /> Category
                </label>
                <button type="button" onClick={() => setShowCustomCategory(!showCustomCategory)} className="text-[9px] font-bold text-[#c8a011] uppercase">
                  {showCustomCategory ? "Presets" : "+ Custom"}
                </button>
              </div>
              {showCustomCategory ? (
                <input type="text" className="w-full bg-transparent border-b border-[#465d6a]/20 py-1 text-[#465d6a] font-bold outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              ) : (
                <div className="relative">
                  <select className="w-full bg-transparent text-[#465d6a] font-bold outline-none appearance-none cursor-pointer pr-8" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="">Select...</option>
                    {isCatering ? (
                      cateringCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                    ) : (
                      cafeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                    )}
                  </select>
                  <ChevronRight size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#c8a011] rotate-90 pointer-events-none" />
                </div>
              )}
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-[#465d6a]/10 shadow-sm">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#465d6a] flex items-center gap-2 mb-2">
                <Hash size={12} className="text-[#c8a011]" /> Display Position
              </label>
              <input type="number" inputMode="numeric" className="w-full bg-transparent text-[#465d6a] font-bold outline-none" value={formData.number_items} onChange={e => setFormData({...formData, number_items: e.target.value})} />
            </div>

            {isCatering && formData.category === 'Party Platters' && (
              <div className="p-4 bg-[#c8a011]/5 rounded-2xl border-2 border-[#c8a011]/20 shadow-sm">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#c8a011] block mb-2">Platter Portions (e.g. "10-12")</label>
                <input type="text" className="w-full bg-transparent text-[#465d6a] font-bold outline-none" placeholder="How many does it serve?" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#465d6a] block mb-2">Item Name</label>
              <input required type="text" className="w-full bg-white border-2 border-[#465d6a]/20 rounded-xl p-4 text-base focus:border-[#c8a011] outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#465d6a] block mb-2">
                {isCatering && formData.category !== 'Party Platters' ? 'Price Per Head' : 'Price'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#465d6a] font-bold">£</span>
                <input required type="text" inputMode="decimal" className="w-full bg-white border-2 border-[#465d6a]/20 rounded-xl p-4 pl-8 text-base focus:border-[#c8a011] outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#465d6a] block mb-2">Description / Menu Details</label>
              <textarea className="w-full bg-white border-2 border-[#465d6a]/20 rounded-xl p-4 text-base focus:border-[#c8a011] outline-none h-32 md:h-40 resize-none italic leading-relaxed" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>

          {!isCatering && (
            <div className={`p-5 rounded-2xl border-2 transition-all ${isDeal ? 'border-[#c8a011] bg-[#c8a011]/5 shadow-inner' : 'border-[#465d6a]/10 bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDeal ? 'bg-[#c8a011] text-white' : 'bg-[#f0ede6] text-[#465d6a]'}`}><Percent size={16} /></div>
                  <span className="text-xs font-black text-[#465d6a] uppercase tracking-widest">Daily Deal</span>
                </div>
                <button type="button" onClick={() => setIsDeal(!isDeal)} className={`w-12 h-6 rounded-full relative transition-colors ${isDeal ? 'bg-[#c8a011]' : 'bg-[#465d6a]/20'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDeal ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              {isDeal && (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c8a011] font-bold">£</span>
                  <input type="text" inputMode="decimal" className="w-full bg-white border-2 border-[#c8a011] rounded-xl p-4 pl-8 text-base outline-none" placeholder="Deal Price" value={formData.deal_price} onChange={e => setFormData({...formData, deal_price: e.target.value})} />
                </div>
              )}
            </div>
          )}
        </form>

        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 bg-gradient-to-t from-[#f8f9fa] via-[#f8f9fa] to-transparent shrink-0">
          <button disabled={loading} onClick={handleSubmit} className="w-full bg-[#c8a011] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_4px_0_#a6850e] active:translate-y-1 active:shadow-none transition-all">
            {loading ? 'Saving...' : (initialData ? 'Update Provision' : 'Add to Inventory')}
          </button>
        </div>
      </div>
    </div>
  );
};