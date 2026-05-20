export type CategoryId =
  | 'grocery'
  | 'food'
  | 'shopping'
  | 'entertainment'
  | 'household'
  | 'travel'
  | 'fitness'
  | 'transport'
  | 'other';

export type FixedCostId = 'rent' | 'insurance';

export type Category = {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
  keywords: string[];
};

export type FixedCost = {
  id: FixedCostId;
  label: string;
};

export const categories: Category[] = [
  {
    id: 'grocery',
    label: 'Grocery',
    emoji: 'B',
    color: '#2F9E6D',
    keywords: ['lidl', 'aldi', 'rewe', 'edeka', 'kaufland', 'dm', 'rossmann', 'market', 'grocery'],
  },
  {
    id: 'food',
    label: 'Food',
    emoji: 'F',
    color: '#F08C35',
    keywords: ['mcdonald', 'burger', 'restaurant', 'cafe', 'coffee', 'pizza', 'kebab', 'lieferando'],
  },
  {
    id: 'shopping',
    label: 'Shopping',
    emoji: 'S',
    color: '#D65DB1',
    keywords: ['amazon', 'zalando', 'h&m', 'zara', 'ikea', 'store', 'shop'],
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    emoji: 'E',
    color: '#6C63FF',
    keywords: ['netflix', 'spotify', 'cinema', 'movie', 'game', 'concert', 'prime', 'disney'],
  },
  {
    id: 'household',
    label: 'Household',
    emoji: 'H',
    color: '#26A6A0',
    keywords: ['cleaning', 'home', 'furniture', 'hardware', 'obi', 'bauhaus', 'household'],
  },
  {
    id: 'travel',
    label: 'Travel',
    emoji: 'T',
    color: '#1C7ED6',
    keywords: ['hotel', 'booking', 'airbnb', 'flight', 'train', 'db ', 'bahn', 'taxi', 'uber'],
  },
  {
    id: 'fitness',
    label: 'Fitness',
    emoji: 'G',
    color: '#E03131',
    keywords: ['gym', 'fitness', 'sport', 'protein', 'yoga'],
  },
  {
    id: 'transport',
    label: 'Transport',
    emoji: 'M',
    color: '#FCC419',
    keywords: ['fuel', 'gas', 'parking', 'ticket', 'transport', 'metro', 'bus'],
  },
  {
    id: 'other',
    label: 'Other',
    emoji: 'O',
    color: '#868E96',
    keywords: [],
  },
];

export const budgetCategories = categories.filter((category) =>
  ['grocery', 'food', 'shopping', 'entertainment', 'household', 'travel', 'other'].includes(
    category.id,
  ),
);

export const fixedCosts: FixedCost[] = [
  { id: 'rent', label: 'Rent' },
  { id: 'insurance', label: 'Insurance' },
];

export const getCategory = (id: CategoryId) =>
  categories.find((category) => category.id === id) ?? categories[categories.length - 1];
