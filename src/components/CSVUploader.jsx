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
        // Transform CSV data to match Supabase column names
        const formattedData = results.data.map(row => ({
          name: row.Name || row.name,
          description: row.Description || row.description,
          price: row.Price || row.price,
          section: (row.Section || row.section || 'cafe').toLowerCase(),
          category: row.Category || row.category,
          // Convert comma-separated string "VG, GF" into array ["VG", "GF"]
          dietary_tags: row.Tags ? row.Tags.split(',').map(t => t.trim().toUpperCase()) : [],
          is_featured: (row.Featured || row.featured || '').toLowerCase() === 'yes'
        }));

        const { error } = await supabase
          .from('menu_items')
          .insert(formattedData);

        if (error) {
          console.error(error);
          setStatus('error');
        } else {
          setStatus('success');
          if (onComplete) onComplete();
        }
        setUploading(false);
      },
      error: (err) => {
        console.error(err);
        setStatus('error');
        setUploading(false);
      }
    });
  };

  return (
    <div className="w-full">
      <label 
        className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all
          ${status === 'success' ? 'border-green-500 bg-green-50' : 
            status === 'error' ? 'border-red-500 bg-red-50' : 
            'border-gray-300 bg-white hover:border-admin-accent hover:bg-gray-50'}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 mb-3 text-admin-accent animate-spin" />
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Processing Spreadsheet...</p>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle2 className="w-10 h-10 mb-3 text-green-500" />
              <p className="text-sm text-green-600 font-bold uppercase tracking-widest">Menu Updated Successfully!</p>
              <p className="text-xs text-green-500 mt-1">Select another file to upload more</p>
            </>
          ) : status === 'error' ? (
            <>
              <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
              <p className="text-sm text-red-600 font-bold uppercase tracking-widest">Upload Failed</p>
              <p className="text-xs text-red-500 mt-1">Check your column headers and try again</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 mb-3 text-gray-400 group-hover:text-admin-accent" />
              <p className="mb-2 text-sm text-gray-700">
                <span className="font-bold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-tighter">CSV (Max 10MB)</p>
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