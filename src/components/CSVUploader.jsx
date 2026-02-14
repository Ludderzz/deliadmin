import React, { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabaseClient';
import { Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const CSVUploader = ({ onComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatus('idle');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const formattedData = results.data.map(row => ({
          name: row.Name || row.name,
          description: row.Description || row.description,
          price: row.Price || row.price,
          section: (row.Section || row.section || 'cafe').toLowerCase(),
          category: row.Category || row.category,
          tags: row.Tags ? row.Tags.split(',').map(t => t.trim().toUpperCase()) : [],
          is_featured: (row.Featured || row.featured || '').toLowerCase() === 'yes'
        }));

        const { error } = await supabase
          .from('menu_items')
          .insert(formattedData);

        if (error) {
          setStatus('error');
        } else {
          setStatus('success');
          if (onComplete) onComplete();
          // Reset to idle after 3 seconds so they can upload more
          setTimeout(() => setStatus('idle'), 3000);
        }
        setUploading(false);
      },
      error: () => {
        setStatus('error');
        setUploading(false);
      }
    });
  };

  return (
    <div className="w-full">
      <label 
        className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
          ${status === 'success' ? 'border-green-500 bg-green-50' : 
            status === 'error' ? 'border-red-500 bg-red-50' : 
            'border-slate-200 bg-white hover:border-deli-gold hover:bg-slate-50'}
        `}
      >
        <div className="flex flex-col items-center justify-center text-center px-4">
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 mb-2 text-deli-gold animate-spin" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Uploading...</p>
            </div>
          ) : status === 'success' ? (
            <div className="flex flex-col items-center animate-in zoom-in duration-300">
              <CheckCircle2 className="w-8 h-8 mb-2 text-green-500" />
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Done!</p>
            </div>
          ) : status === 'error' ? (
            <div className="flex flex-col items-center animate-in shake duration-300">
              <AlertCircle className="w-8 h-8 mb-2 text-red-500" />
              <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest">Error - Check CSV</p>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 mb-2 text-slate-300" />
              <p className="text-xs text-slate-600 font-medium">
                <span className="text-deli-mustard font-bold">Bulk Upload</span> CSV
              </p>
              <p className="text-[9px] text-slate-400 uppercase tracking-tighter mt-1">Tap to select</p>
            </>
          )}
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept=".csv" 
          onChange={handleFileUpload}
          disabled={uploading}
        />
      </label>
    </div>
  );
};