import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Upload, X, Save, Loader2, Store, CookingPot } from 'lucide-react';

// Helper to compress images before upload to keep the site fast
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; // Large enough for quality, small enough for speed
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.8); // 80% quality is the sweet spot
      };
    };
  });
};

export const DeliAdmin = () => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [breadContent, setBreadContent] = useState('');
  const [breadImages, setBreadImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const INFO_ID = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    fetchCurrentInfo();
  }, []);

  const fetchCurrentInfo = async () => {
    const { data } = await supabase.from('deli_bottom_info').select('*').eq('id', INFO_ID).single();
    if (data) {
      setContent(data.content || '');
      setImages(data.image_urls || []);
      setBreadContent(data.bread_content || '');
      setBreadImages(data.bread_image_urls || []);
    }
  };

  const handleImageUpload = async (e, type = 'general') => {
    const file = e.target.files[0];
    if (!file) return;

    const currentImages = type === 'bread' ? breadImages : images;
    if (currentImages.length >= 6) {
      alert("Maximum 6 images allowed.");
      return;
    }

    setUploading(type);

    try {
      // 1. COMPRESS: Shrink the file size before it leaves the computer
      const compressedFile = await compressImage(file);
      
      const fileName = `${type}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('deli-gallery')
        .upload(fileName, compressedFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('deli-gallery').getPublicUrl(fileName);
      
      // 2. UPDATE UI: Use local URL for instant feedback (Optimistic)
      if (type === 'bread') {
        setBreadImages(prev => [...prev, data.publicUrl].slice(0, 6));
      } else {
        setImages(prev => [...prev, data.publicUrl].slice(0, 6));
      }

    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (url, type = 'general') => {
    if (type === 'bread') {
      setBreadImages(prev => prev.filter(img => img !== url));
    } else {
      setImages(prev => prev.filter(img => img !== url));
    }
  };

  const saveAll = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('deli_bottom_info')
      .update({ 
        content, 
        image_urls: images, 
        bread_content: breadContent, 
        bread_image_urls: breadImages,
        updated_at: new Date() 
      })
      .eq('id', INFO_ID);

    if (!error) {
      alert("Deli page updated successfully!");
    } else {
      alert("Error saving: " + error.message);
    }
    setSaving(false);
  };

  // MINI COMPONENT for grids
  const ImageGrid = ({ currentImages, onRemove, onUpload, isUploading, label }) => (
    <div className="mb-8">
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
        {label} ({currentImages.length}/6)
      </label>
      <div className="flex flex-wrap gap-3 mb-4">
        {currentImages.map((url, i) => (
          <div key={`${url}-${i}`} className="relative w-[30%] md:w-[15%] aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm">
            {/* THUMBNAIL OPTIMIZATION: We only load tiny previews in admin */}
            <img 
              src={`${url}?width=200&quality=50`} 
              alt="Preview" 
              className="w-full h-full object-cover" 
            />
            <button 
              onClick={() => onRemove(url)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full z-10 shadow-lg"
              type="button"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        {currentImages.length < 6 && (
          <label className="flex flex-col items-center justify-center w-[30%] md:w-[15%] aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all cursor-pointer">
            {isUploading ? (
              <Loader2 className="animate-spin text-amber-500" />
            ) : (
              <Upload className="text-slate-300" size={20} />
            )}
            <input type="file" className="hidden" onChange={onUpload} accept="image/*" disabled={isUploading} />
          </label>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 mt-10 mb-20">
      
      {/* SECTION 1: ARTISAN BREAD */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                <Store size={24} /> 
            </div>
            <div>
                <h2 className="text-3xl font-serif italic text-slate-900 leading-tight">Artisan Bread</h2>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Daily bakes & Sourdough</p>
            </div>
        </div>
        
        <textarea 
          value={breadContent}
          onChange={(e) => setBreadContent(e.target.value)}
          className="w-full bg-slate-50 border-0 rounded-[1.5rem] p-5 text-sm focus:ring-2 focus:ring-amber-400 h-24 mb-6 outline-none"
          placeholder="Describe your daily bakes..."
        />

        <ImageGrid 
          currentImages={breadImages} 
          onRemove={(url) => removeImage(url, 'bread')} 
          onUpload={(e) => handleImageUpload(e, 'bread')}
          isUploading={uploading === 'bread'}
          label="Bread Gallery"
        />
      </section>

      <div className="h-px bg-slate-100 mb-12" />

      {/* SECTION 2: SEASONAL GALLERY */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <CookingPot size={24} /> 
            </div>
            <div>
                <h2 className="text-3xl font-serif italic text-slate-900 leading-tight">Seasonal Deli</h2>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Local produce & jars</p>
            </div>
        </div>

        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-slate-50 border-0 rounded-[1.5rem] p-5 text-sm focus:ring-2 focus:ring-blue-400 h-24 mb-6 outline-none"
          placeholder="What's on the shelves this month?"
        />

        <ImageGrid 
          currentImages={images} 
          onRemove={(url) => removeImage(url, 'general')} 
          onUpload={(e) => handleImageUpload(e, 'general')}
          isUploading={uploading === 'general'}
          label="Deli Gallery"
        />
      </section>

      <button 
        onClick={saveAll}
        disabled={saving}
        className="w-full bg-slate-900 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
      >
        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="text-amber-400" />}
        Publish All Deli Changes
      </button>
    </div>
  );
};