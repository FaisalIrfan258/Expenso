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
  color: string;
  keywords: string[];
};

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: CategoryId;
  note?: string;
  date: string;
};

export type AppState = {
  monthlyBudget: number;
  monthlySpendLimit: number;
  fixedCosts: Record<FixedCostId, number>;
  expenses: Expense[];
  hasCompletedSetup: boolean;
};

export const categories: Category[] = [
  {
    id: 'grocery',
    label: 'Grocery',
    color: '#2F9E6D',
    keywords: ['lidl', 'aldi', 'rewe', 'edeka', 'kaufland', 'dm', 'rossmann', 'market', 'grocery'],
  },
  {
    id: 'food',
    label: 'Food',
    color: '#F08C35',
    keywords: ['mcdonald', 'burger', 'restaurant', 'cafe', 'coffee', 'pizza', 'kebab', 'lieferando'],
  },
  {
    id: 'shopping',
    label: 'Shopping',
    color: '#D65DB1',
    keywords: ['amazon', 'zalando', 'h&m', 'zara', 'ikea', 'store', 'shop'],
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    color: '#6C63FF',
    keywords: ['netflix', 'spotify', 'cinema', 'movie', 'game', 'concert', 'prime', 'disney'],
  },
  {
    id: 'household',
    label: 'Household',
    color: '#26A6A0',
    keywords: ['cleaning', 'home', 'furniture', 'hardware', 'obi', 'bauhaus', 'household'],
  },
  {
    id: 'travel',
    label: 'Travel',
    color: '#1C7ED6',
    keywords: ['hotel', 'booking', 'airbnb', 'flight', 'train', 'db ', 'bahn', 'taxi', 'uber'],
  },
  {
    id: 'fitness',
    label: 'Fitness',
    color: '#E03131',
    keywords: ['gym', 'fitness', 'sport', 'protein', 'yoga'],
  },
  {
    id: 'transport',
    label: 'Transport',
    color: '#FCC419',
    keywords: ['fuel', 'gas', 'parking', 'ticket', 'transport', 'metro', 'bus'],
  },
  {
    id: 'other',
    label: 'Other',
    color: '#868E96',
    keywords: [],
  },
];

export const initialState: AppState = {
  monthlyBudget: 0,
  monthlySpendLimit: 0,
  fixedCosts: {
    rent: 0,
    insurance: 0,
  },
  expenses: [],
  hasCompletedSetup: false,
};

export const formatEuro = (amount: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat('de-DE', {
    currency: 'EUR',
    maximumFractionDigits,
    style: 'currency',
  }).format(Number.isFinite(amount) ? amount : 0);

export const parseAmount = (value: string) => {
  const parsed = Number.parseFloat(value.replace(',', '.').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getCategory = (id: CategoryId) =>
  categories.find((category) => category.id === id) ?? categories[categories.length - 1];

export const detectCategory = (title: string): CategoryId => {
  const query = title.trim().toLowerCase();
  const match = categories.find((category) =>
    category.keywords.some((keyword) => query.includes(keyword)),
  );
  return match?.id ?? 'other';
};

export const getCurrentMonthKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const getMonthlyExpenses = (expenses: Expense[]) =>
  expenses.filter((expense) => expense.date.startsWith(getCurrentMonthKey()));

export const getFixedTotal = (state: AppState) => state.fixedCosts.rent + state.fixedCosts.insurance;

export const getVariableSpent = (state: AppState) =>
  getMonthlyExpenses(state.expenses).reduce((total, expense) => total + expense.amount, 0);

export const getTotalSpent = (state: AppState) => getFixedTotal(state) + getVariableSpent(state);

export const getRemainingSpendLimit = (state: AppState) =>
  state.monthlySpendLimit - getVariableSpent(state);

export const getRemainingBudget = (state: AppState) => state.monthlyBudget - getTotalSpent(state);

export const getSavingsEstimate = (state: AppState) =>
  Math.max(0, state.monthlyBudget - getFixedTotal(state) - state.monthlySpendLimit);

export const getCategoryTotals = (state: AppState) =>
  categories
    .map((category) => ({
      ...category,
      amount: getMonthlyExpenses(state.expenses)
        .filter((expense) => expense.category === category.id)
        .reduce((total, expense) => total + expense.amount, 0),
    }))
    .filter((category) => category.amount > 0)
    .sort((a, b) => b.amount - a.amount);

export const getWarnings = (state: AppState) => {
  const warnings: string[] = [];
  const variableSpent = getVariableSpent(state);
  const totalSpent = getTotalSpent(state);
  const monthDay = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const timeProgress = monthDay / daysInMonth;
  const spendProgress = state.monthlySpendLimit > 0 ? variableSpent / state.monthlySpendLimit : 0;

  if (totalSpent > state.monthlyBudget) {
    warnings.push('Warning: This month is now in minus.');
  }

  if (state.monthlySpendLimit > 0 && variableSpent > state.monthlySpendLimit) {
    warnings.push('You exceeded your planned monthly spending. Extra spend reduces savings first.');
  }

  if (spendProgress > timeProgress + 0.18) {
    warnings.push('Your flexible spending is moving faster than the month.');
  }

  return warnings;
};

export const getTrend = (expenses: Expense[]) => {
  const buckets = new Map<string, number>();
  expenses.forEach((expense) => {
    const label = new Date(expense.date).toLocaleDateString('en-US', { month: 'short' });
    buckets.set(label, (buckets.get(label) ?? 0) + expense.amount);
  });
  return Array.from(buckets.entries()).slice(-6).map(([label, amount]) => ({ label, amount }));
};

const mistralKey = import.meta.env.VITE_MISTRAL_API_KEY;
const mistralModel = import.meta.env.VITE_MISTRAL_MODEL ?? 'mistral-small-latest';

export const isMistralEnabled = Boolean(mistralKey && mistralKey !== 'your_mistral_api_key_here');

export const suggestCategoryWithAi = async (expense: {
  amount: number;
  note?: string;
  title: string;
}): Promise<CategoryId> => {
  const fallback = detectCategory(expense.title);

  if (!isMistralEnabled) {
    return fallback;
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content:
              'Classify the expense into exactly one allowed category. Return JSON only: {"category":"grocery"}.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              allowedCategories: categories.map((category) => category.id),
              ...expense,
            }),
          },
        ],
        model: mistralModel,
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
      headers: {
        Authorization: `Bearer ${mistralKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    const content = String(data?.choices?.[0]?.message?.content ?? '');
    const parsed = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] ?? content) as {
      category?: CategoryId;
    };

    return categories.some((category) => category.id === parsed.category) && parsed.category
      ? parsed.category
      : fallback;
  } catch {
    return fallback;
  }
};
