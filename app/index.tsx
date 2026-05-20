import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { usePalette } from '@/hooks/use-palette';
import { useBudget } from '@/state/BudgetContext';

export default function EntryScreen() {
  const palette = usePalette();
  const { hasCompletedSetup, isHydrated } = useBudget();

  if (!isHydrated) {
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <ActivityIndicator color={palette.primary} />
        <AppText variant="muted">Preparing your budget...</AppText>
      </View>
    );
  }

  return <Redirect href={(hasCompletedSetup ? '/(tabs)' : '/setup') as never} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 14,
    justifyContent: 'center',
  },
});
