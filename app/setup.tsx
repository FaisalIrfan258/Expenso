import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AmountField } from '@/components/AmountField';
import { AppScreen } from '@/components/AppScreen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { fixedCosts } from '@/data/categories';
import { useBudget } from '@/state/BudgetContext';
import { BudgetSetup } from '@/types/budget';
import { getFixedTotal } from '@/utils/budget';
import { parseAmount } from '@/utils/money';

export default function SetupScreen() {
  const budget = useBudget();
  const { completeSetup } = budget;
  const [step, setStep] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(
    budget.monthlyBudget > 0 ? String(budget.monthlyBudget) : '',
  );
  const [monthlySpendLimit, setMonthlySpendLimit] = useState(
    budget.monthlySpendLimit > 0 ? String(budget.monthlySpendLimit) : '',
  );
  const [fixedValues, setFixedValues] = useState<Record<string, string>>(() =>
    fixedCosts.reduce(
      (acc, item) => ({
        ...acc,
        [item.id]: budget.fixedCosts[item.id] > 0 ? String(budget.fixedCosts[item.id]) : '',
      }),
      {},
    ),
  );
  const setup: BudgetSetup = {
    monthlyBudget: parseAmount(monthlyBudget),
    monthlySpendLimit: parseAmount(monthlySpendLimit),
    fixedCosts: fixedCosts.reduce(
      (acc, item) => ({ ...acc, [item.id]: parseAmount(fixedValues[item.id] ?? '') }),
      {} as BudgetSetup['fixedCosts'],
    ),
    categoryBudgets: {},
  };
  const estimatedSavings = setup.monthlyBudget - getFixedTotal(setup.fixedCosts) - setup.monthlySpendLimit;

  const finish = () => {
    completeSetup(setup);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.keyboard}>
      <AppScreen>
        <View style={styles.hero}>
          <AppText variant="eyebrow">Expenso setup</AppText>
          <AppText variant="title">
            {step === 0 ? 'Build your monthly money plan.' : null}
            {step === 1 ? 'Add fixed costs once.' : null}
            {step === 2 ? 'Choose your spending cap.' : null}
          </AppText>
          <AppText variant="muted">
            {step === 0
              ? 'Your budget stays on this device. No account, no backend, no friction.'
              : step === 1
                ? 'For now, Expenso tracks rent and insurance as fixed monthly costs.'
                : 'This is the flexible amount you want to spend this month. The rest becomes estimated savings.'}
          </AppText>
        </View>

        <Card>
          {step === 0 ? (
            <AmountField label="Total monthly budget" value={monthlyBudget} onChangeText={setMonthlyBudget} />
          ) : null}

          {step === 1
            ? fixedCosts.map((cost) => (
                <AmountField
                  key={cost.id}
                  label={cost.label}
                  value={fixedValues[cost.id] ?? ''}
                  onChangeText={(value) => setFixedValues((current) => ({ ...current, [cost.id]: value }))}
                />
              ))
            : null}

          {step === 2 ? (
            <>
              <AmountField
                label="How much do you want to spend this month?"
                value={monthlySpendLimit}
                onChangeText={setMonthlySpendLimit}
              />
              <AppText variant="muted">
                Estimated savings: {Math.max(0, estimatedSavings).toLocaleString('de-DE')} EUR
              </AppText>
            </>
          ) : null}
        </Card>

        <View style={styles.actions}>
          {step > 0 ? <PrimaryButton tone="soft" onPress={() => setStep((value) => value - 1)}>Back</PrimaryButton> : null}
          <PrimaryButton
            disabled={step === 0 && setup.monthlyBudget <= 0}
            onPress={() => (step < 2 ? setStep((value) => value + 1) : finish())}>
            {step < 2 ? 'Continue' : 'Start tracking'}
          </PrimaryButton>
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
  },
  hero: {
    gap: 10,
    paddingTop: 28,
  },
  keyboard: {
    flex: 1,
  },
});
