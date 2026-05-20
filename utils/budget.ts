import { categories, CategoryId, FixedCostId } from '@/data/categories';
import { AppState, Expense } from '@/types/budget';

export type CategoryTotal = {
  id: CategoryId;
  label: string;
  color: string;
  amount: number;
  budget: number;
};

export const getCurrentMonthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const isCurrentMonth = (isoDate: string) => isoDate.startsWith(getCurrentMonthKey());

export const sumValues = <T extends string>(record: Partial<Record<T, number>>) =>
  (Object.values(record) as number[]).reduce((total, value) => total + (Number(value) || 0), 0);

export const getMonthlyExpenses = (expenses: Expense[]) =>
  expenses.filter((expense) => isCurrentMonth(expense.date));

export const getFixedTotal = (fixedCosts: Record<FixedCostId, number>) => sumValues(fixedCosts);

export const getVariableSpent = (expenses: Expense[]) =>
  getMonthlyExpenses(expenses).reduce((total, expense) => total + expense.amount, 0);

export const getTotalSpent = (state: AppState) =>
  getFixedTotal(state.fixedCosts) + getVariableSpent(state.expenses);

export const getRemainingBudget = (state: AppState) => state.monthlyBudget - getTotalSpent(state);

export const getRemainingSpendLimit = (state: AppState) =>
  state.monthlySpendLimit - getVariableSpent(state.expenses);

export const getSavingsEstimate = (state: AppState) =>
  Math.max(0, state.monthlyBudget - getFixedTotal(state.fixedCosts) - state.monthlySpendLimit);

export const getCategoryTotals = (state: AppState): CategoryTotal[] => {
  const monthlyExpenses = getMonthlyExpenses(state.expenses);

  return categories
    .map((category) => {
      const amount = monthlyExpenses
        .filter((expense) => expense.category === category.id)
        .reduce((total, expense) => total + expense.amount, 0);

      return {
        id: category.id,
        label: category.label,
        color: category.color,
        amount,
        budget: state.categoryBudgets[category.id] ?? 0,
      };
    })
    .filter((category) => category.amount > 0 || category.budget > 0)
    .sort((a, b) => b.amount - a.amount);
};

export const getWarnings = (state: AppState) => {
  const warnings: string[] = [];
  const spent = getTotalSpent(state);
  const variableSpent = getVariableSpent(state.expenses);
  const remaining = getRemainingBudget(state);
  const monthDay = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const timeProgress = monthDay / daysInMonth;
  const budgetProgress = state.monthlyBudget > 0 ? spent / state.monthlyBudget : 0;
  const spendProgress = state.monthlySpendLimit > 0 ? variableSpent / state.monthlySpendLimit : 0;

  if (remaining < 0) {
    warnings.push('Warning: Overspending this month.');
  } else if (budgetProgress >= 0.9) {
    warnings.push('You have used more than 90% of your monthly budget.');
  }

  if (state.monthlySpendLimit > 0 && variableSpent > state.monthlySpendLimit) {
    warnings.push('Warning: You exceeded your planned monthly spending.');
  }

  if (spendProgress > timeProgress + 0.18) {
    warnings.push('Your flexible spending is moving faster than the month.');
  }

  return warnings;
};

export const getTrend = (expenses: Expense[]) => {
  const buckets = new Map<string, number>();

  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const key = date.toLocaleDateString('en-US', { month: 'short' });
    buckets.set(key, (buckets.get(key) ?? 0) + expense.amount);
  });

  return Array.from(buckets.entries()).slice(-6).map(([label, amount]) => ({ label, amount }));
};
