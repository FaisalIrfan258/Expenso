import { Pressable, StyleSheet, View } from 'react-native';

import { getCategory } from '@/data/categories';
import { Expense } from '@/types/budget';
import { formatEuro } from '@/utils/money';
import { AppText } from './AppText';
import { usePalette } from '@/hooks/use-palette';

export function ExpenseCard({
  expense,
  onDelete,
}: {
  expense: Expense;
  onDelete?: (id: string) => void;
}) {
  const palette = usePalette();
  const category = getCategory(expense.category);
  const date = new Date(expense.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <Pressable
      onLongPress={() => onDelete?.(expense.id)}
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
      ]}>
      <View style={[styles.icon, { backgroundColor: category.color }]}>
        <AppText style={styles.iconText}>{category.emoji}</AppText>
      </View>
      <View style={styles.body}>
        <AppText style={styles.title}>{expense.title}</AppText>
        <AppText variant="muted">
          {category.label} - {date}
        </AppText>
        {expense.note ? <AppText variant="muted">{expense.note}</AppText> : null}
      </View>
      <AppText style={styles.amount}>{formatEuro(expense.amount)}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontSize: 16,
    fontWeight: '900',
  },
  body: {
    flex: 1,
    gap: 3,
  },
  card: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  icon: {
    alignItems: 'center',
    borderRadius: 18,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  iconText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
});
