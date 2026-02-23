const GEMS_KEY = 'gemstone_business_gems';

const initialGems = [
  {
    id: '1',
    name: 'Blue Sapphire',
    description: 'A stunning deep blue sapphire, perfect for rings.',
    price: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1599707367072-cd6ad66acc40?auto=format&fit=crop&q=80&w=800',
    category: 'Precious',
  },
  {
    id: '2',
    name: 'Ruby',
    description: 'A vibrant red ruby with excellent clarity.',
    price: 950,
    imageUrl: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=800',
    category: 'Precious',
  },
  {
    id: '3',
    name: 'Emerald',
    description: 'Lush green emerald from Colombia.',
    price: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1600078652297-7d5a528cc839?auto=format&fit=crop&q=80&w=800',
    category: 'Precious',
  }
];

/**
 * @typedef {Object} Gem
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {string} imageUrl
 * @property {string} category
 */
export const gemService = {
  getAll: () => {
    const stored = localStorage.getItem(GEMS_KEY);
    if (!stored) {
      localStorage.setItem(GEMS_KEY, JSON.stringify(initialGems));
      return initialGems;
    }
    return JSON.parse(stored);
  },

  getById: (id) => {
    const gems = gemService.getAll();
    return gems.find(g => g.id === id);
  },

  /**
   * @param {Omit<Gem, 'id'>} gem
   */
  add: (gem) => {
    const gems = gemService.getAll();
    const newGem = { ...gem, id: Date.now().toString() };
    const updatedGems = [...gems, newGem];
    localStorage.setItem(GEMS_KEY, JSON.stringify(updatedGems));
    return newGem;
  },

  update: (id, updatedGem) => {
    const gems = gemService.getAll();
    const index = gems.findIndex(g => g.id === id);
    if (index !== -1) {
      gems[index] = { ...gems[index], ...updatedGem, id };
      localStorage.setItem(GEMS_KEY, JSON.stringify(gems));
      return gems[index];
    }
    return null;
  },

  delete: (id) => {
    const gems = gemService.getAll();
    const filteredGems = gems.filter(g => g.id !== id);
    localStorage.setItem(GEMS_KEY, JSON.stringify(filteredGems));
  }
};
