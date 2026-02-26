import { supabase } from '../lib/supabaseClient';

/**
 * @typedef {Object} GemstoneType
 * @property {string} id
 * @property {string} name
 * @property {string} [imgUrl]
 * @property {number} displayOrder
 */

/**
 * Constructs the public URL for a gemstone type image in 'gemstone_bucket'
 * @param {string} name 
 * @returns {string}
 */
const getGemImgUrl = (name) => {
  if (!name) return '';
  const slug = name.toLowerCase().trim().replace(/[\s\W]+/g, '-');
  return `https://iivkxnrhxazuygylucdv.supabase.co/storage/v1/object/public/gemtype_bucket/types/${slug}.jpg`;
};

/**
 * Converts a database row to a GemstoneType object
 * @param {Record<string, any>} row
 * @returns {GemstoneType}
 */
const toType = (row) => ({
  id: row.id,
  name: row.name,
  imgUrl: getGemImgUrl(row.name),
  displayOrder: row.display_order ?? 0,
});

export const gemstoneTypeService = {
  /** * Fetches all gemstone types.
   * OPTIMIZATION: We specify columns to avoid fetching heavy base64 data 
   * that causes the 57014 timeout error.
   * @returns {Promise<GemstoneType[]>} 
   */
  getAll: async () => {
    const { data, error } = await supabase
      .from('gemstone_types')
      .select('id, name, display_order') // img_url no longer needed in table
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return (data ?? []).map(toType);
  },

  /**
   * @param {string} name
   * @param {number} [displayOrder]
   */
  add: async (name, displayOrder = 0) => {
    const { data, error } = await supabase
      .from('gemstone_types')
      .insert([{ name, display_order: displayOrder }])
      .select()
      .single();
    
    if (error) throw error;
    return toType(data);
  },

  /**
   * @param {string} id
   * @param {string} name
   */
  update: async (id, name) => {
    const { data, error } = await supabase
      .from('gemstone_types')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toType(data);
  },

  /**
   * Deletes a gemstone type by ID.
   * @param {string} id
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    const { error } = await supabase
      .from('gemstone_types')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  /**
   * Bulk-seed default types if the table is empty.
   * @param {Array<{name: string, img: string}>} defaults
   * @returns {Promise<void>}
   */
  seedDefaults: async (defaults) => {
    const { count } = await supabase
      .from('gemstone_types')
      .select('*', { count: 'exact', head: true });
    
    if (count && count > 0) return; // already seeded
    
    const rows = defaults.map((d, i) => ({
      name: d.name,
      display_order: i,
    }));
    
    await supabase.from('gemstone_types').insert(rows);
  },
  supabase: supabase, // Expose for storage operations in components
};