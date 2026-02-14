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
        is_deal: isCatering ? false : isDeal, // Force false for catering
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
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-deli-green/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
        
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl font-serif text-deli-green italic">
            {initialData ? 'Edit Product' : (isCatering ? 'Add Catering Package' : 'Add New Item')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* IMAGE UPLOAD */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">
              {isCatering ? 'Package Gallery Image' : 'Product Image'}
            </label>
            <div 
              onClick={() => document.getElementById('imageInput').click()}
              className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-deli-gold transition-all overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <>
                  <UploadCloud className="text-slate-300 mb-2" size={32} />
                  <span className="text-xs text-slate-400 italic">Click to upload photo</span>
                </>
              )}
              <input id="imageInput" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {isCatering ? 'Package Name' : 'Item Name'}
              </label>
              <input required type="text" className="admin-input" placeholder={isCatering ? "e.g. Luxury Sandwich Platter" : "e.g. Somerset Brie Sourdough"} 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {isCatering ? 'Price (Per Head)' : 'Regular Price'}
                </label>
                <input required type="text" className="admin-input" placeholder="£12.50" 
                  value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Section</label>
                <select className="admin-input" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})}>
                  <option value="cafe">Cafe</option>
                  <option value="deli">Deli Retail</option>
                  <option value="catering">Catering</option>
                </select>
              </div>
            </div>
          </div>

          {/* HIDE DEALS IF CATERING */}
          {!isCatering ? (
            <div className={`p-4 rounded-2xl border transition-all ${isDeal ? 'border-deli-gold bg-deli-gold/5' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Percent size={16} className={isDeal ? 'text-deli-gold' : 'text-gray-400'} />
                  <span className="text-sm font-bold text-deli-green uppercase tracking-wider">Set as Daily Deal?</span>
                </div>
                <input type="checkbox" checked={isDeal} onChange={e => setIsDeal(e.target.checked)} className="w-5 h-5 accent-deli-gold" />
              </div>
              {isDeal && (
                <input type="text" className="admin-input border-deli-gold/30" placeholder="Deal Price (e.g. £5.00)" 
                  value={formData.deal_price} onChange={e => setFormData({...formData, deal_price: e.target.value})} />
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-deli-green/20 bg-deli-green/5 flex items-center gap-4">
               <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-deli-green shadow-sm">
                  <Users size={20} />
               </div>
               <div>
                  <p className="text-xs font-bold text-deli-green uppercase tracking-tight">Catering Mode Active</p>
                  <p className="text-[10px] text-gray-500 italic">Include min. order counts in the description.</p>
               </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {isCatering ? 'Package Overview' : 'Description'}
              </label>
              <textarea className="admin-input h-24" placeholder={isCatering ? "What's included in this platter?" : "Describe the flavors..."} 
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {isCatering ? 'Full Menu / Item List' : 'Ingredients'}
              </label>
              <textarea className="admin-input h-20" placeholder={isCatering ? "List the specific items included..." : "Flour, water, salt..."} 
                value={formData.ingredients} onChange={e => setFormData({...formData, ingredients: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-3">Dietary Tags</label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map(tag => (
                <button key={tag} type="button" onClick={() => handleTagToggle(tag)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                    formData.tags.includes(tag) ? 'bg-deli-green text-white border-deli-green' : 'bg-white text-gray-400 border-gray-200'
                  }`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button disabled={loading} type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-2">
            {loading ? 'Saving Changes...' : (
              <>{initialData ? <Save size={18}/> : <Plus size={18}/>} {initialData ? 'Update Live Menu' : 'Add to Live Menu'}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};