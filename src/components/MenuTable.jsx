import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Trash2, Edit3, Tag, Star, ImageIcon } from 'lucide-react';

// Pass onEdit as a prop from the Dashboard
export const MenuTable = ({ onEdit }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setItems(data);
    setLoading(false);
  };

  const deleteItem = async (id) => {
    if (window.confirm('Are you sure you want to remove this item? This cannot be undone.')) {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (!error) fetchItems();
    }
  };

  if (loading) return <div className="p-8 text-center font-serif italic text-gray-400">Loading live menu...</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-serif italic text-xl text-deli-green">Live Inventory</h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {items.length} Items Total
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <th className="px-6 py-4 font-bold">Item Details</th>
              <th className="px-6 py-4 font-bold">Section</th>
              <th className="px-6 py-4 font-bold">Price</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    {/* Tiny Image Preview */}
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200 flex items-center justify-center">
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={14} className="text-slate-300" />
                      )}
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 flex items-center gap-2">
                        {item.name}
                        {item.is_deal && (
                          <span className="bg-deli-gold/10 text-deli-gold p-1 rounded-md" title="Daily Deal">
                            <Star size={10} fill="currentColor" />
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-slate-400 line-clamp-1 italic font-light">
                        {item.description || 'No description provided.'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-md tracking-wider ${
                    item.section === 'cafe' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {item.section}
                  </span>
                </td>
                <td className="px-6 py-4 font-serif text-deli-green font-bold">
                  {item.price}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* EDIT BUTTON: Triggers the onEdit prop */}
                    <button 
                      onClick={() => onEdit(item)}
                      className="p-2 text-slate-400 hover:text-deli-green transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="p-20 text-center">
          <Tag className="mx-auto text-slate-200 mb-4" size={48} />
          <p className="text-slate-400 font-serif italic text-lg">No items found in the kitchen.</p>
        </div>
      )}
    </div>
  );
};