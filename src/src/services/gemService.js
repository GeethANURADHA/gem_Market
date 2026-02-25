import { supabase } from '../lib/supabaseClient';

/**
 * @typedef {Object} Gem
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {number} carat
 * @property {string} imageUrl
 * @property {string} category
 */

/**
 * Constructs the public URL for a gem image in 'gems_bucket'
 * @param {string} id 
 * @returns {string}
 */
const getGemImgUrl = (id) => {
  if (!id) return '';
  return `https://iivkxnrhxazuygylucdv.supabase.co/storage/v1/object/public/gems_bucket/items/${id}.jpg`;
};

/**
 * @param {Record<string, any>} row
 * @returns {Gem}
 */
const toGem = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: row.price,
  carat: row.carat,
  imageUrl: getGemImgUrl(row.id),
  category: row.category,
});

/**
 * @param {Record<string, any>} gem
 * @returns {Record<string, any>}
 */
const toRow = (gem) => ({
  name: gem.name,
  description: gem.description,
  price: gem.price,
  carat: gem.carat,
  // image_url: gem.imageUrl, // Removed: images stored in gems_bucket by ID
  category: gem.category,
});

export const gemService = {
  /** @returns {Promise<Gem[]>} */
  getAll: async () => {
    const { data, error } = await supabase
      .from('gems')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toGem);
  },

  /**
   * @param {string} id
   * @returns {Promise<Gem>}
   */
  getById: async (id) => {
    const { data, error } = await supabase
      .from('gems')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return toGem(data);
  },

  /**
   * @param {{name:string,description:string,price:number,carat:number,category:string}} gem
   * @returns {Promise<Gem>}
   */
  add: async (gem) => {
    const { data, error } = await supabase
      .from('gems')
      .insert([toRow(gem)])
      .select()
      .single();
    if (error) throw error;
    return toGem(data);
  },

  /**
   * @param {string} id
   * @param {Record<string,any>} updatedGem
   * @returns {Promise<Gem>}
   */
  update: async (id, updatedGem) => {
    const { data, error } = await supabase
      .from('gems')
      .update(toRow(updatedGem))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return toGem(data);
  },

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    const { error } = await supabase
      .from('gems')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
  supabase,
};
