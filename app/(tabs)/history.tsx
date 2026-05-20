import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { CategoryPill } from '@/components/CategoryPill';
import { ExpenseCard } from '@/components/ExpenseCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { categories, CategoryId, getCategory } from '@/data/categories';
import { usePalette } from '@/hooks/use-palette';
import { useBudget } from '@/state/BudgetContext';

export default function HistoryScreen() {
  const palette = usePalette();
  const { expenses, deleteExpense, resetDemoData } = useBudget();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CategoryId | 'all'>('all');

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();

    return expenses
      .filter((expense) => (filter === 'all' ? true : expense.category === filter))
      .filter((expense) =>
        [expense.title, expense.note ?? '', expense.category].some((value) =>
          value.toLowerCase().includes(normalized),
        ),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filter, query]);

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, expense) => {
    const label = getCategory(expense.category).label;
    acc[label] = [...(acc[label] ?? []), expense];
    return acc;
  }, {});

  const confirmStartOver = () => {
    Alert.alert(
      'Start over?',
      'This clears your expenses and budget setup, then returns to the first setup screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start over',
          style: 'destructive',
          onPress: () => {
            resetDemoData();
            router.replace('/setup' as never);
          },
        },
      ],
    );
  };

  return (
    <AppScreen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="eyebrow">History</AppText>
          <AppText variant="title">Every euro, searchable.</AppText>
        </View>
        {expenses.length ? (
          <PrimaryButton tone="soft" onPress={confirmStartOver}>
            Start over
          </PrimaryButton>
        ) : null}
      </View>

      <Card>
        <TextInput
          onChangeText={setQuery}
          placeholder="Search expenses"
          placeholderTextColor={palette.muted}
          style={[styles.search, { borderColor: palette.border, color: palette.text }]}
          value={query}
        />
        <View style={styles.pills}>
          <CategoryPill
            category={{ id: 'other', label: 'All', emoji: 'A', color: palette.primary, keywords: [] }}
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          {categories.map((category) => (
            <CategoryPill
              key={category.id}
              category={category}
              selected={filter === category.id}
              onPress={() => setFilter(category.id)}
            />
          ))}
        </View>
      </Card>

      {Object.entries(grouped).length ? (
        Object.entries(grouped).map(([label, items]) => (
          <View key={label} style={styles.group}>
            <AppText variant="heading">{label}</AppText>
            {items.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} onDelete={deleteExpense} />
            ))}
          </View>
        ))
      ) : (
        <Card>
          <AppText variant="heading">No expenses yet</AppText>
          <AppText variant="muted">
            Add your first expense and Expenso will start building your monthly picture.
          </AppText>
        </Card>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 10,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  headerText: {
    flex: 1,
    gap: 10,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  search: {
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 17,
    fontWeight: '700',
    minHeight: 56,
    paddingHorizontal: 16,
  },
});
