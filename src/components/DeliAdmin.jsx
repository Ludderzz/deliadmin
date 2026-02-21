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

    const { error: uploadError } = await supabase.storage
      .from('deli-gallery')
      .upload(filePath, file);

    if (!uploadError) {
      const { data } = supabase.storage.from('deli-gallery').getPublicUrl(filePath);
      setImages([...images, data.publicUrl]);
    }
    setUploading(false);
  };

  const removeImage = (url) => {
    setImages(images.filter(img => img !== url));
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
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-3xl shadow-sm border border-slate-100 mt-10">
      <h2 className="text-3xl font-serif text-deli-blue mb-8">Edit Deli Bottom Section</h2>

      {/* TEXT CONTENT */}
      <div className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Bottom Page Content</label>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-deli-mustard h-32"
          placeholder="Add seasonal info, opening times, or special notes..."
        />
      </div>

      {/* IMAGE UPLOAD */}
      <div className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          Gallery Images ({images.length}/6)
        </label>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {images.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group">
              <img src={url} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          
          {images.length < 6 && (
            <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-deli-mustard transition-colors cursor-pointer bg-slate-50">
              {uploading ? <Loader2 className="animate-spin text-deli-mustard" /> : <Upload className="text-slate-400" />}
              <span className="text-[10px] mt-2 font-bold uppercase text-slate-400">Upload Photo</span>
              <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={uploading} />
            </label>
          )}
        </div>
      </div>

      <button 
        onClick={saveAll}
        disabled={saving}
        className="w-full bg-deli-blue text-white py-4 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-deli-mustard transition-all shadow-xl"
      >
        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
        Publish Changes to Deli Page
      </button>
    </div>
  );
};