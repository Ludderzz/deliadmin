import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Upload, X, Save, Loader2 } from 'lucide-react';

export const DeliAdmin = () => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const INFO_ID = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    fetchCurrentInfo();
  }, []);

  const fetchCurrentInfo = async () => {
    const { data, error } = await supabase
      .from('deli_bottom_info')
      .select('*')
      .single();
    if (data) {
      setContent(data.content);
      setImages(data.image_urls || []);
    }
  };

  const handleImageUpload = async (e) => {
    // Safety check: Don't allow more than 6
    if (images.length >= 6) {
      alert("Maximum 6 images allowed.");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `bottom-gallery/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('deli-gallery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('deli-gallery').getPublicUrl(filePath);
      
      // Use functional update to ensure we always have the latest array
      setImages(prev => {
        if (prev.length >= 6) return prev;
        return [...prev, data.publicUrl];
      });

    } catch (error) {
      console.error("Upload error:", error.message);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // Reset input value so same file can be uploaded if deleted
      e.target.value = '';
    }
  };

  const removeImage = (url) => {
    setImages(prev => prev.filter(img => img !== url));
  };

  const saveAll = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('deli_bottom_info')
      .update({ content, image_urls: images, updated_at: new Date() })
      .eq('id', INFO_ID);

    if (!error) alert("Deli page updated successfully!");
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white rounded-3xl shadow-sm border border-slate-100 mt-10">
      <h2 className="text-2xl md:text-3xl font-serif text-deli-blue mb-8">Edit Deli Bottom Section</h2>

      {/* TEXT CONTENT */}
      <div className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Bottom Page Content</label>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-deli-mustard h-32"
          placeholder="Add seasonal info..."
        />
      </div>

      {/* IMAGE UPLOAD - REBUILT FOR MOBILE STABILITY */}
      <div className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
          Gallery Images ({images.length}/6)
        </label>
        
        {/* Using flex-wrap and percentage widths to guarantee the 6th image has space */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-4">
          {images.map((url, i) => (
            <div 
              key={`${url}-${i}`} 
              className="relative w-[30%] md:w-[15%] aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50"
            >
              <img src={url} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full z-10 shadow-md"
                type="button"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </div>
          ))}
          
          {images.length < 6 && (
            <label className="flex flex-col items-center justify-center w-[30%] md:w-[15%] aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-deli-mustard transition-colors cursor-pointer bg-slate-50 active:bg-slate-100">
              {uploading ? (
                <Loader2 className="animate-spin text-deli-mustard" />
              ) : (
                <>
                  <Upload className="text-slate-400" size={20} />
                  <span className="text-[8px] mt-1 font-bold uppercase text-slate-400">Add</span>
                </>
              )}
              <input 
                type="file" 
                className="hidden" 
                onChange={handleImageUpload} 
                accept="image/*" 
                disabled={uploading} 
              />
            </label>
          )}
        </div>
      </div>

      <button 
        onClick={saveAll}
        disabled={saving}
        className="w-full bg-deli-blue text-white py-4 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-deli-mustard transition-all shadow-xl active:scale-[0.98]"
      >
        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
        Publish Changes
      </button>
    </div>
  );
};