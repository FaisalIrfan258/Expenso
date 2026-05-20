import { CategoryId, FixedCostId } from '@/data/categories';

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: CategoryId;
  note?: string;
  date: string;
};

export type BudgetSetup = {
  monthlyBudget: number;
  monthlySpendLimit: number;
  fixedCosts: Record<FixedCostId, number>;
  categoryBudgets: Partial<Record<CategoryId, number>>;
};

export type AppState = BudgetSetup & {
  expenses: Expense[];
  hasCompletedSetup: boolean;
};
