import { categories, CategoryId } from '@/data/categories';
import { AppState, Expense } from '@/types/budget';
import {
  getCategoryTotals,
  getFixedTotal,
  getRemainingBudget,
  getRemainingSpendLimit,
  getSavingsEstimate,
  getVariableSpent,
} from '@/utils/budget';
import { detectCategory } from '@/utils/categoryDetection';
import { formatEuro } from '@/utils/money';

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.EXPO_PUBLIC_MISTRAL_API_KEY;
const MISTRAL_MODEL = process.env.EXPO_PUBLIC_MISTRAL_MODEL ?? 'mistral-small-latest';

type MistralMessage = {
  role: 'system' | 'user';
  content: string;
};

export const isMistralEnabled = Boolean(MISTRAL_API_KEY && MISTRAL_API_KEY !== 'your_mistral_api_key_here');

const extractJson = (content: string) => {
  const match = content.match(/\{[\s\S]*\}/);
  return match ? match[0] : content;
};

const callMistral = async (messages: MistralMessage[]) => {
  if (!isMistralEnabled) {
    return null;
  }

  const response = await fetch(MISTRAL_API_URL, {
    body: JSON.stringify({
      messages,
      model: MISTRAL_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
    headers: {
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Mistral request failed: ${response.status}`);
  }

  const data = await response.json();
  return String(data?.choices?.[0]?.message?.content ?? '');
};

export const suggestCategoryWithAi = async ({
  amount,
  note,
  title,
}: {
  amount: number;
  note?: string;
  title: string;
}): Promise<CategoryId> => {
  const fallback = detectCategory(title);

  try {
    const content = await callMistral([
      {
        role: 'system',
        content:
          'You classify personal expenses into exactly one allowed category. Return JSON only: {"category":"grocery"}.',
      },
      {
        role: 'user',
        content: JSON.stringify({
          allowedCategories: categories.map((category) => category.id),
          amount,
          note,
          title,
        }),
      },
    ]);

    if (!content) {
      return fallback;
    }

    const parsed = JSON.parse(extractJson(content)) as { category?: CategoryId };
    const valid = categories.some((category) => category.id === parsed.category);

    return valid && parsed.category ? parsed.category : fallback;
  } catch {
    return fallback;
  }
};

export const generateAiWarnings = async (state: AppState, localWarnings: string[]) => {
  if (!isMistralEnabled || !localWarnings.length) {
    return localWarnings;
  }

  const recentExpenses: Pick<Expense, 'title' | 'amount' | 'category' | 'date'>[] = state.expenses
    .slice(0, 8)
    .map(({ title, amount, category, date }) => ({ title, amount, category, date }));

  try {
    const content = await callMistral([
      {
        role: 'system',
        content:
          'You write concise, friendly budget warnings for a personal finance app. Return JSON only: {"warnings":["..."]}. Max 3 warnings, each under 90 characters. No markdown.',
      },
      {
        role: 'user',
        content: JSON.stringify({
          categoryTotals: getCategoryTotals(state).slice(0, 5),
          fixedCosts: formatEuro(getFixedTotal(state.fixedCosts)),
          localWarnings,
          monthlyBudget: formatEuro(state.monthlyBudget),
          monthlySpendLimit: formatEuro(state.monthlySpendLimit),
          recentExpenses,
          remainingAfterAllSpending: formatEuro(getRemainingBudget(state)),
          remainingSpendLimit: formatEuro(getRemainingSpendLimit(state)),
          savingsEstimate: formatEuro(getSavingsEstimate(state)),
          variableSpent: formatEuro(getVariableSpent(state.expenses)),
        }),
      },
    ]);

    if (!content) {
      return localWarnings;
    }

    const parsed = JSON.parse(extractJson(content)) as { warnings?: string[] };
    const warnings = parsed.warnings
      ?.filter((warning) => typeof warning === 'string' && warning.trim().length > 0)
      .map((warning) => warning.trim())
      .slice(0, 3);

    return warnings?.length ? warnings : localWarnings;
  } catch {
    return localWarnings;
  }
};
