import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { PieChart } from '@/components/PieChart';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import { usePalette } from '@/hooks/use-palette';
import { useBudget } from '@/state/BudgetContext';
import {
  getCategoryTotals,
  getFixedTotal,
  getRemainingBudget,
  getRemainingSpendLimit,
  getSavingsEstimate,
  getTotalSpent,
  getVariableSpent,
  getWarnings,
} from '@/utils/budget';
import { generateAiWarnings, isMistralEnabled } from '@/utils/mistral';
import { formatEuro } from '@/utils/money';

export default function DashboardScreen() {
  const budget = useBudget();
  const palette = usePalette();
  const spent = getTotalSpent(budget);
  const flexibleSpent = getVariableSpent(budget.expenses);
  const remaining = getRemainingBudget(budget);
  const remainingSpendLimit = getRemainingSpendLimit(budget);
  const fixedTotal = getFixedTotal(budget.fixedCosts);
  const savings = getSavingsEstimate(budget);
  const categories = getCategoryTotals(budget);
  const localWarnings = useMemo(() => getWarnings(budget), [budget]);
  const [warnings, setWarnings] = useState(localWarnings);
  const progress = budget.monthlySpendLimit > 0 ? flexibleSpent / budget.monthlySpendLimit : 0;

  useEffect(() => {
    let isActive = true;

    setWarnings(localWarnings);

    if (isMistralEnabled && localWarnings.length) {
      generateAiWarnings(budget, localWarnings).then((aiWarnings) => {
        if (isActive) {
          setWarnings(aiWarnings);
        }
      });
    }

    return () => {
      isActive = false;
    };
  }, [budget, localWarnings]);

  return (
    <AppScreen>
      <View style={styles.header}>
        <View>
          <AppText variant="eyebrow">This month</AppText>
          <AppText variant="title">Expenso</AppText>
        </View>
        <PrimaryButton tone="soft" onPress={() => router.push('/setup' as never)}>
          Edit
        </PrimaryButton>
      </View>

      <Card style={[styles.heroCard, { backgroundColor: palette.primary }]}>
        <AppText variant="eyebrow" style={{ color: palette.primarySoft }}>
          Left to spend
        </AppText>
        <AppText variant="metric" style={{ color: palette.surface }}>
          {formatEuro(remainingSpendLimit)}
        </AppText>
        <ProgressBar progress={progress} color={palette.accent} height={12} />
        <View style={styles.heroStats}>
          <Stat label="Spend cap" value={formatEuro(budget.monthlySpendLimit)} inverse />
          <Stat label="Spent" value={formatEuro(flexibleSpent)} inverse />
        </View>
      </Card>

      {warnings.length ? (
        <Card style={{ borderColor: palette.danger }}>
          <AppText variant="heading" style={{ color: palette.danger }}>
            {isMistralEnabled ? 'AI budget warnings' : 'Budget warnings'}
          </AppText>
          {warnings.slice(0, 3).map((warning) => (
            <AppText key={warning}>- {warning}</AppText>
          ))}
        </Card>
      ) : null}

      <View style={styles.grid}>
        <Card style={styles.gridCard}>
          <Stat label="Fixed costs" value={formatEuro(fixedTotal)} />
        </Card>
        <Card style={styles.gridCard}>
          <Stat label="Savings estimate" value={formatEuro(savings)} />
        </Card>
      </View>

      <Card>
        <View style={styles.categoryRow}>
          <AppText variant="muted">Total monthly budget</AppText>
          <AppText style={styles.categoryText}>{formatEuro(budget.monthlyBudget)}</AppText>
        </View>
        <View style={styles.categoryRow}>
          <AppText variant="muted">Total used including fixed costs</AppText>
          <AppText style={styles.categoryText}>{formatEuro(spent)}</AppText>
        </View>
        <View style={styles.categoryRow}>
          <AppText variant="muted">Budget after all spending</AppText>
          <AppText style={styles.categoryText}>{formatEuro(remaining)}</AppText>
        </View>
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <View>
            <AppText variant="heading">Where it goes</AppText>
            <AppText variant="muted">Category-wise spending</AppText>
          </View>
        </View>
        {categories.length ? (
          <>
            <PieChart slices={categories} total={categories.reduce((sum, item) => sum + item.amount, 0)} />
            {categories.slice(0, 5).map((category) => (
              <View key={category.id} style={styles.categoryRow}>
                <View style={styles.categoryLabel}>
                  <View style={[styles.dot, { backgroundColor: category.color }]} />
                  <AppText style={styles.categoryText}>{category.label}</AppText>
                </View>
                <View style={styles.categoryAmount}>
                  <AppText style={styles.categoryText}>{formatEuro(category.amount)}</AppText>
                  {category.budget > 0 ? (
                    <AppText variant="muted">{Math.round((category.amount / category.budget) * 100)}%</AppText>
                  ) : null}
                </View>
              </View>
            ))}
          </>
        ) : (
          <AppText variant="muted">Add an expense to unlock your category breakdown.</AppText>
        )}
      </Card>
    </AppScreen>
  );
}

function Stat({ label, value, inverse }: { label: string; value: string; inverse?: boolean }) {
  const palette = usePalette();

  return (
    <View style={styles.stat}>
      <AppText variant="muted" style={inverse ? { color: palette.primarySoft } : undefined}>
        {label}
      </AppText>
      <AppText variant="heading" style={inverse ? { color: palette.surface } : undefined}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  categoryAmount: {
    alignItems: 'flex-end',
  },
  categoryLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  categoryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryText: {
    fontWeight: '800',
  },
  dot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCard: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  heroCard: {
    gap: 18,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    gap: 4,
  },
});
