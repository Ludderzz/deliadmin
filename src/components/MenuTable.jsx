import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Trash2, Edit3, Tag, Star, MapPin, Search, Layers } from 'lucide-react';

export const MenuTable = ({ onEdit }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      // Sorting by section and category makes the table much easier to read
      .order('section', { ascending: true })
      .order('category', { ascending: true });

    if (!error) setItems(data);
    setLoading(false);
  };

  const deleteItem = async (id) => {
    if (window.confirm('Are you sure you want to remove this item? This cannot be undone.')) {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (!error) fetchItems();
    }
  };

  // Improved search to include category filtering
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="p-8 text-center font-serif italic text-gray-400">Loading live menu...</div>;

  return (
    <div className="w-full max-w-full relative">
      {/* Search & Stats Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" 
            placeholder="Search name, section, or category..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-deli-mustard transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-100 px-4 py-2 rounded-full">
          {filteredItems.length} Products Found
        </span>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        {/* MOBILE VIEW */}
        <div className="block md:hidden divide-y divide-slate-50">
          {filteredItems.map((item) => (
            <div key={item.id} className="p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                      {item.section}
                    </span>
                    {/* Category Tag for Mobile */}
                    {item.category && (
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-deli-mustard/10 text-deli-mustard rounded">
                        {item.category}
                      </span>
                    )}
                    {item.is_deal && <Star size={10} className="text-deli-mustard fill-deli-mustard" />}
                  </div>
                  <h4 className="font-bold text-slate-800 truncate">{item.name}</h4>
                  <p className="text-xs text-deli-green font-bold mt-1">{item.price}</p>
                </div>
                
                <div className="flex gap-1">
                  <button onClick={() => onEdit(item)} className="p-2 text-slate-400 bg-slate-50 rounded-lg"><Edit3 size={16}/></button>
                  <button onClick={() => deleteItem(item.id)} className="p-2 text-red-300 bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-50 bg-slate-50/30">
                <th className="px-8 py-5 font-bold">Listing Details</th>
                <th className="px-8 py-5 font-bold">Classification</th>
                <th className="px-8 py-5 font-bold">Price</th>
                <th className="px-8 py-5 font-bold text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-deli-blue">{item.name}</span>
                        {item.is_deal && <Star size={12} className="text-deli-mustard fill-deli-mustard" />}
                      </div>
                      {item.ingredients && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 italic">
                          <MapPin size={10} /> {item.ingredients}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        {item.section}
                      </span>
                      {item.category && (
                        <div className="flex items-center gap-1 text-deli-mustard font-bold text-[10px] uppercase tracking-tighter">
                          <Layers size={10} /> {item.category}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 font-serif text-deli-blue font-bold">
                    {item.is_deal ? (
                      <div className="flex flex-col leading-tight">
                        <span className="text-deli-mustard">{item.deal_price}</span>
                        <span className="text-[9px] text-slate-300 line-through">{item.price}</span>
                      </div>
                    ) : item.price}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(item)} className="text-slate-400 hover:text-deli-blue transition-colors flex items-center gap-1 text-xs font-bold uppercase">
                        <Edit3 size={14} /> Edit
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-bold uppercase">
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="p-20 text-center">
            <Tag className="mx-auto text-slate-100 mb-4" size={48} />
            <p className="text-slate-400 font-serif italic">No provisions found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};