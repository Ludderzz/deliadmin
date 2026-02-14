import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Trash2, Edit3, Tag, Star, ImageIcon, MoreVertical } from 'lucide-react';

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
    // FIX: Added 'max-w-full' and 'relative' to ensure the container never grows
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm w-full max-w-full relative">
      {/* Header */}
      <div className="p-5 md:p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h3 className="font-serif italic text-xl text-deli-green">Live Inventory</h3>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
          {items.length} Items
        </span>
      </div>

      {/* 1. MOBILE VIEW: CARD LIST */}
      <div className="block md:hidden divide-y divide-slate-50 overflow-hidden w-full">
        {items.map((item) => (
          // FIX: Changed gap and ensured w-full + overflow-hidden
          <div key={item.id} className="p-4 flex items-center justify-between gap-2 active:bg-slate-50 transition-colors w-full overflow-hidden">
            
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-100">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} className="text-slate-300" /></div>
                )}
              </div>
              
              {/* FIX: Nested min-w-0 is required for 'truncate' to work inside flexbox */}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800 text-sm truncate flex items-center gap-1">
                  {item.name}
                  {item.is_deal && <Star size={10} className="text-deli-gold fill-deli-gold shrink-0" />}
                </p>
                <div className="flex items-center gap-2 mt-0.5 overflow-hidden">
                  <span className="text-[9px] font-black uppercase text-deli-green whitespace-nowrap shrink-0">{item.price}</span>
                  <span className="text-[8px] text-slate-400 shrink-0">•</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 truncate break-all">{item.section}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-0 shrink-0">
              <button onClick={() => onEdit(item)} className="p-2 text-slate-400 active:text-deli-green rounded-xl transition-all">
                <Edit3 size={18} />
              </button>
              <button onClick={() => deleteItem(item.id)} className="p-2 text-slate-400 active:text-red-500 rounded-xl transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 2. DESKTOP VIEW: TABLE */}
      {/* FIX: Added 'table-fixed' to the table to prevent column expansion */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-50">
              <th className="px-6 py-4 font-bold w-1/2">Item Details</th>
              <th className="px-6 py-4 font-bold">Section</th>
              <th className="px-6 py-4 font-bold">Price</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200 flex items-center justify-center">
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon size={14} className="text-slate-300" /></div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 overflow-hidden">
                      <span className="font-bold text-slate-700 flex items-center gap-2 truncate">
                        {item.name}
                        {item.is_deal && (
                          <span className="bg-deli-gold/10 text-deli-gold p-1 rounded-md shrink-0" title="Daily Deal">
                            <Star size={10} fill="currentColor" />
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-slate-400 line-clamp-1 italic font-light truncate">
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
                <td className="px-6 py-4 font-serif text-deli-green font-bold whitespace-nowrap">
                  {item.price}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(item)} className="p-2 text-slate-400 hover:text-deli-green transition-colors">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
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
          <p className="text-slate-400 font-serif italic text-lg">No items found.</p>
        </div>
      )}
    </div>
  );
};