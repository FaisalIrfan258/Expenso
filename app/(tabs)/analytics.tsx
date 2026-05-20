import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { PieChart } from '@/components/PieChart';
import { ProgressBar } from '@/components/ProgressBar';
import { usePalette } from '@/hooks/use-palette';
import { useBudget } from '@/state/BudgetContext';
import {
  getCategoryTotals,
  getRemainingSpendLimit,
  getTotalSpent,
  getTrend,
  getVariableSpent,
} from '@/utils/budget';
import { formatEuro } from '@/utils/money';

export default function AnalyticsScreen() {
  const budget = useBudget();
  const palette = usePalette();
  const categoryTotals = getCategoryTotals(budget);
  const variableTotal = categoryTotals.reduce((sum, item) => sum + item.amount, 0);
  const biggest = categoryTotals[0];
  const spent = getTotalSpent(budget);
  const flexibleSpent = getVariableSpent(budget.expenses);
  const remaining = getRemainingSpendLimit(budget);
  const trend = getTrend(budget.expenses);
  const trendMax = Math.max(...trend.map((item) => item.amount), 1);

  return (
    <AppScreen>
      <View style={styles.header}>
        <AppText variant="eyebrow">Insights</AppText>
        <AppText variant="title">Know the pattern, change the outcome.</AppText>
      </View>

      <Card>
        <View style={styles.metrics}>
          <Insight label="Biggest category" value={biggest?.label ?? 'None yet'} />
          <Insight label="Left to spend" value={formatEuro(remaining)} />
        </View>
        <ProgressBar
          progress={budget.monthlySpendLimit > 0 ? flexibleSpent / budget.monthlySpendLimit : 0}
          color={palette.accent}
        />
        <AppText variant="muted">Total used including fixed costs: {formatEuro(spent)}</AppText>
      </Card>

      <Card>
        <AppText variant="heading">Monthly trend</AppText>
        {trend.length ? (
          <View style={styles.chart}>
            {trend.map((item) => (
              <View key={item.label} style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: palette.primary,
                      height: Math.max(18, (item.amount / trendMax) * 150),
                    },
                  ]}
                />
                <AppText variant="muted">{item.label}</AppText>
              </View>
            ))}
          </View>
        ) : (
          <AppText variant="muted">Monthly spending trends appear after adding expenses.</AppText>
        )}
      </Card>

      <Card>
        <AppText variant="heading">Category breakdown</AppText>
        {categoryTotals.length ? (
          <>
            <PieChart slices={categoryTotals} total={variableTotal} />
            {categoryTotals.map((category) => (
              <View key={category.id} style={styles.row}>
                <View style={styles.rowLabel}>
                  <View style={[styles.dot, { backgroundColor: category.color }]} />
                  <AppText style={styles.bold}>{category.label}</AppText>
                </View>
                <AppText style={styles.bold}>{formatEuro(category.amount)}</AppText>
              </View>
            ))}
          </>
        ) : (
          <AppText variant="muted">No category data yet.</AppText>
        )}
      </Card>
    </AppScreen>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.insight}>
      <AppText variant="muted">{label}</AppText>
      <AppText variant="heading">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: 999,
    width: 28,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
    justifyContent: 'flex-end',
  },
  bold: {
    fontWeight: '800',
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
    height: 190,
  },
  dot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  header: {
    gap: 10,
    paddingTop: 8,
  },
  insight: {
    flex: 1,
    gap: 4,
  },
  metrics: {
    flexDirection: 'row',
    gap: 14,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
});
