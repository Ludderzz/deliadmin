import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Plus, Image as ImageIcon, Percent, UploadCloud, Save, Users } from 'lucide-react';

export const AddItemModal = ({ isOpen, onClose, onRefresh, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [isDeal, setIsDeal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    deal_price: '',
    description: '',
    ingredients: '',
    section: 'cafe',
    category: '',
    tags: [],
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
      });
      setIsDeal(initialData.is_deal || false);
      setImagePreview(initialData.image_url || null);
    } else if (!initialData && isOpen) {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFormData({ name: '', price: '', deal_price: '', description: '', ingredients: '', section: 'cafe', category: '', tags: [] });
    setImageFile(null);
    setImagePreview(null);
    setIsDeal(false);
  };

  const dietaryOptions = ['VG', 'GF', 'DF', 'V', 'Nuts'];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;
    const { error: uploadError } = await supabase.storage.from('menu-images').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

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
      let publicImageUrl = imagePreview;
      if (imageFile) publicImageUrl = await uploadImage(imageFile);

      const itemPayload = {
        ...formData,
        image_url: publicImageUrl,
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
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-deli-green/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Drawer Container */}
      <div className="relative w-full md:max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-2xl md:text-3xl font-serif text-deli-green italic">
            {initialData ? 'Edit Product' : (isCatering ? 'Add Catering' : 'Add New Item')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
        </div>
        
        {/* Scrollable Form Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 pb-32">
          
          {/* IMAGE UPLOAD */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-3">
              {isCatering ? 'Package Gallery Image' : 'Product Image'}
            </label>
            <div 
              onClick={() => document.getElementById('imageInput').click()}
              className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-deli-gold transition-all overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="text-center p-4">
                  <UploadCloud className="text-slate-300 mx-auto mb-2" size={32} />
                  <span className="text-xs text-slate-400 italic block">Tap to upload photo</span>
                </div>
              )}
              <input id="imageInput" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2">
                {isCatering ? 'Package Name' : 'Item Name'}
              </label>
              <input 
                required 
                type="text" 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-base md:text-sm focus:border-deli-gold outline-none transition-all" 
                placeholder={isCatering ? "e.g. Luxury Sandwich Platter" : "e.g. Somerset Brie Sourdough"} 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2">
                  {isCatering ? 'Price (Per Head)' : 'Regular Price'}
                </label>
                <input 
                  required 
                  type="text" 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-base focus:border-deli-gold outline-none" 
                  placeholder="£12.50" 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2">Section</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-base focus:border-deli-gold outline-none appearance-none" 
                  value={formData.section} 
                  onChange={e => setFormData({...formData, section: e.target.value})}
                >
                  <option value="cafe">Cafe</option>
                  <option value="deli">Deli Retail</option>
                  <option value="catering">Catering</option>
                </select>
              </div>
            </div>
          </div>

          {/* DEALS TOGGLE */}
          {!isCatering ? (
            <div className={`p-5 rounded-2xl border transition-all ${isDeal ? 'border-deli-gold bg-deli-gold/5' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDeal ? 'bg-deli-gold text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <Percent size={16} />
                  </div>
                  <span className="text-sm font-bold text-deli-green uppercase tracking-wider">Set as Daily Deal?</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={isDeal} 
                  onChange={e => setIsDeal(e.target.checked)} 
                  className="w-6 h-6 rounded-lg accent-deli-gold cursor-pointer" 
                />
              </div>
              {isDeal && (
                <input 
                  type="text" 
                  className="w-full bg-white border-2 border-deli-gold/30 rounded-xl p-4 text-base focus:border-deli-gold outline-none animate-in fade-in slide-in-from-top-2" 
                  placeholder="Deal Price (e.g. £5.00)" 
                  value={formData.deal_price} 
                  onChange={e => setFormData({...formData, deal_price: e.target.value})} 
                />
              )}
            </div>
          ) : (
            <div className="p-5 rounded-2xl border border-deli-green/20 bg-deli-green/5 flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-deli-green shadow-sm shrink-0">
                  <Users size={20} />
               </div>
               <div>
                  <p className="text-xs font-bold text-deli-green uppercase tracking-tight leading-none mb-1">Catering Mode</p>
                  <p className="text-[10px] text-slate-500 italic">Mention minimum order counts in description.</p>
               </div>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2">
                {isCatering ? 'Package Overview' : 'Description'}
              </label>
              <textarea 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-base focus:border-deli-gold outline-none h-24" 
                placeholder={isCatering ? "What's included in this platter?" : "Describe the flavours..."} 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2">
                {isCatering ? 'Item List' : 'Ingredients'}
              </label>
              <textarea 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-base focus:border-deli-gold outline-none h-20" 
                placeholder={isCatering ? "List specific items..." : "Flour, water, salt..."} 
                value={formData.ingredients} 
                onChange={e => setFormData({...formData, ingredients: e.target.value})} 
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-3">Dietary Tags</label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map(tag => (
                <button 
                  key={tag} 
                  type="button" 
                  onClick={() => handleTagToggle(tag)}
                  className={`px-5 py-2 rounded-full text-[10px] font-black border transition-all active:scale-90 ${
                    formData.tags.includes(tag) 
                    ? 'bg-deli-green text-white border-deli-green shadow-md shadow-deli-green/20' 
                    : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Fixed Footer Button */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 backdrop-blur-md">
          <button 
            disabled={loading} 
            onClick={handleSubmit}
            className="w-full bg-deli-green text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:shadow-xl active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : (
              <>{initialData ? <Save size={18}/> : <Plus size={18}/>} {initialData ? 'Update Live Menu' : 'Add to Live Menu'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};