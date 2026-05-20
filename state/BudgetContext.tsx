import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { CategoryId, FixedCostId, fixedCosts } from '@/data/categories';
import { AppState, BudgetSetup, Expense } from '@/types/budget';

const STORAGE_KEY = 'expenso:v1';

type BudgetContextValue = AppState & {
  isHydrated: boolean;
  completeSetup: (setup: BudgetSetup) => void;
  updateSetup: (setup: BudgetSetup) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  clearExpenses: () => void;
  resetDemoData: () => void;
};

const emptyFixedCosts = fixedCosts.reduce(
  (acc, cost) => ({ ...acc, [cost.id]: 0 }),
  {} as Record<FixedCostId, number>,
);

const initialState: AppState = {
  monthlyBudget: 0,
  monthlySpendLimit: 0,
  fixedCosts: emptyFixedCosts,
  categoryBudgets: {},
  expenses: [],
  hasCompletedSetup: false,
};

const BudgetContext = createContext<BudgetContextValue | null>(null);

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function BudgetProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AppState>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value) {
          setState({ ...initialState, ...JSON.parse(value) });
        }
      })
      .finally(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    if (isHydrated) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [isHydrated, state]);

  const completeSetup = (setup: BudgetSetup) => {
    setState((current) => ({
      ...current,
      ...setup,
      hasCompletedSetup: true,
    }));
  };

  const updateSetup = (setup: BudgetSetup) => {
    setState((current) => ({
      ...current,
      ...setup,
    }));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setState((current) => ({
      ...current,
      expenses: [{ ...expense, id: createId() }, ...current.expenses],
    }));
  };

  const deleteExpense = (id: string) => {
    setState((current) => ({
      ...current,
      expenses: current.expenses.filter((expense) => expense.id !== id),
    }));
  };

  const clearExpenses = () => {
    setState((current) => ({
      ...current,
      expenses: [],
    }));
  };

  const resetDemoData = () => setState(initialState);

  return (
    <BudgetContext.Provider
      value={{
        ...state,
        isHydrated,
        completeSetup,
        updateSetup,
        addExpense,
        deleteExpense,
        clearExpenses,
        resetDemoData,
      }}>
      {children}
    </BudgetContext.Provider>
  );
}

export const useBudget = () => {
  const value = useContext(BudgetContext);

  if (!value) {
    throw new Error('useBudget must be used inside BudgetProvider');
  }

  return value;
};
