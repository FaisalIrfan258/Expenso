import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { AmountField } from '@/components/AmountField';
import { AppScreen } from '@/components/AppScreen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { CategoryPill } from '@/components/CategoryPill';
import { PrimaryButton } from '@/components/PrimaryButton';
import { categories, CategoryId, getCategory } from '@/data/categories';
import { usePalette } from '@/hooks/use-palette';
import { useBudget } from '@/state/BudgetContext';
import { getRemainingBudget, getRemainingSpendLimit } from '@/utils/budget';
import { detectCategory } from '@/utils/categoryDetection';
import { isMistralEnabled, suggestCategoryWithAi } from '@/utils/mistral';
import { formatEuro, parseAmount } from '@/utils/money';

export default function AddExpenseScreen() {
  const palette = usePalette();
  const budget = useBudget();
  const { addExpense } = budget;
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('other');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualCategory, setManualCategory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!manualCategory) {
      setCategory(detectCategory(title));
    }
  }, [manualCategory, title]);

  const detected = getCategory(detectCategory(title));
  const expenseAmount = parseAmount(amount);
  const canSave = title.trim().length > 1 && expenseAmount > 0;
  const remainingSpendLimit = getRemainingSpendLimit(budget);
  const remainingTotalBudget = getRemainingBudget(budget);
  const spendOverflow = Math.max(0, expenseAmount - remainingSpendLimit);
  const budgetAfterExpense = remainingTotalBudget - expenseAmount;
  const impactMessage =
    spendOverflow > 0
      ? budgetAfterExpense >= 0
        ? `${formatEuro(spendOverflow)} is over your spend cap and will reduce estimated savings.`
        : `${formatEuro(spendOverflow)} is over your spend cap. This puts your month at ${formatEuro(budgetAfterExpense)}.`
      : `After this expense, you will have ${formatEuro(remainingSpendLimit - expenseAmount)} left to spend.`;

  const save = async () => {
    if (!canSave || isSaving) {
      return;
    }

    setIsSaving(true);
    const finalCategory = manualCategory
      ? category
      : await suggestCategoryWithAi({
          amount: expenseAmount,
          note,
          title,
        });

    addExpense({
      amount: parseAmount(amount),
      category: finalCategory,
      date: new Date(date).toISOString(),
      note: note.trim(),
      title: title.trim(),
    });

    setTitle('');
    setAmount('');
    setNote('');
    setCategory('other');
    setManualCategory(false);
    setIsSaving(false);
    router.push('/(tabs)/history' as never);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.keyboard}>
      <AppScreen>
        <View style={styles.header}>
          <AppText variant="eyebrow">New expense</AppText>
          <AppText variant="title">Add it before you forget.</AppText>
          <AppText variant="muted">
            Category suggestion: {title ? detected.label : 'type a title first'}
            {isMistralEnabled ? ' - AI will verify on save' : ''}
          </AppText>
        </View>

        <Card>
          <View style={styles.field}>
            <AppText variant="muted">Expense title</AppText>
            <TextInput
              onChangeText={setTitle}
              placeholder="Lidl, Netflix, Coffee..."
              placeholderTextColor={palette.muted}
              style={[styles.input, { borderColor: palette.border, color: palette.text }]}
              value={title}
            />
          </View>
          <AmountField label="Amount" value={amount} onChangeText={setAmount} />
          {expenseAmount > 0 ? (
            <View
              style={[
                styles.impact,
                {
                  backgroundColor: spendOverflow > 0 ? `${palette.accent}22` : palette.primarySoft,
                  borderColor: spendOverflow > 0 ? palette.accent : palette.border,
                },
              ]}>
              <AppText style={{ color: spendOverflow > 0 ? palette.accent : palette.primary, fontWeight: '800' }}>
                {spendOverflow > 0 ? 'Spending cap warning' : 'Budget impact'}
              </AppText>
              <AppText variant="muted">{impactMessage}</AppText>
            </View>
          ) : null}
          <View style={styles.field}>
            <AppText variant="muted">Date</AppText>
            <TextInput
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={palette.muted}
              style={[styles.input, { borderColor: palette.border, color: palette.text }]}
              value={date}
            />
          </View>
          <View style={styles.field}>
            <AppText variant="muted">Optional note</AppText>
            <TextInput
              multiline
              onChangeText={setNote}
              placeholder="Add context"
              placeholderTextColor={palette.muted}
              style={[styles.input, styles.note, { borderColor: palette.border, color: palette.text }]}
              value={note}
            />
          </View>
        </Card>

        <Card>
          <AppText variant="heading">Category</AppText>
          <View style={styles.pills}>
            <CategoryPill
              category={{
                id: 'other',
                label: 'Auto',
                emoji: 'A',
                color: palette.primary,
                keywords: [],
              }}
              selected={!manualCategory}
              onPress={() => {
                setManualCategory(false);
                setCategory(detectCategory(title));
              }}
            />
            {categories.map((item) => (
              <CategoryPill
                key={item.id}
                category={item}
                selected={manualCategory && category === item.id}
                onPress={() => {
                  setCategory(item.id);
                  setManualCategory(true);
                }}
              />
            ))}
          </View>
        </Card>

        <PrimaryButton disabled={!canSave || isSaving} onPress={save}>
          {isSaving ? (
            <View style={styles.saving}>
              <ActivityIndicator color={palette.surface} />
              <AppText style={{ color: palette.surface, fontWeight: '800' }}>Saving...</AppText>
            </View>
          ) : (
            'Save expense'
          )}
        </PrimaryButton>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  header: {
    gap: 10,
    paddingTop: 8,
  },
  input: {
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 17,
    fontWeight: '700',
    minHeight: 58,
    paddingHorizontal: 16,
  },
  impact: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    padding: 14,
  },
  keyboard: {
    flex: 1,
  },
  note: {
    minHeight: 92,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  saving: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
});
