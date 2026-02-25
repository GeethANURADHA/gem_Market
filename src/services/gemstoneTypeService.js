import { supabase } from '../lib/supabaseClient';

/**
 * @typedef {Object} GemstoneType
 * @property {string} id
 * @property {string} name
 * @property {string} [imgUrl]
 * @property {number} displayOrder
 */

/**
 * @param {Record<string, any>} row
 * @returns {GemstoneType}
 */
const toType = (row) => ({
  id: row.id,
  name: row.name,
  imgUrl: row.img_url ?? '',
  displayOrder: row.display_order ?? 0,
});

export const gemstoneTypeService = {
  /** @returns {Promise<GemstoneType[]>} */
  getAll: async () => {
    const { data, error } = await supabase
      .from('gemstone_types')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toType);
  },

  /**
   * @param {string} name
   * @param {string} [imgUrl]
   * @param {number} [displayOrder]
   * @returns {Promise<GemstoneType>}
   */
  add: async (name, imgUrl = '', displayOrder = 0) => {
    const { data, error } = await supabase
      .from('gemstone_types')
      .insert([{ name, img_url: imgUrl, display_order: displayOrder }])
      .select()
      .single();
    if (error) throw error;
    return toType(data);
  },

  /**
   * @param {string} id
   * @param {string} name
   * @param {string} [imgUrl]
   * @returns {Promise<GemstoneType>}
   */
  update: async (id, name, imgUrl) => {
    const updates = /** @type {Record<string, any>} */ ({ name });
    if (imgUrl !== undefined) updates.img_url = imgUrl;
    const { data, error } = await supabase
      .from('gemstone_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return toType(data);
  },

  /**
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
      img_url: d.img,
      display_order: i,
    }));
    await supabase.from('gemstone_types').insert(rows);
  },
};
