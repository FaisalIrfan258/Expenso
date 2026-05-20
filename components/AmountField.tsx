import { StyleSheet, TextInput, View } from 'react-native';

import { radius } from '@/constants/design';
import { usePalette } from '@/hooks/use-palette';
import { AppText } from './AppText';

type AmountFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function AmountField({ label, value, onChangeText, placeholder = '0' }: AmountFieldProps) {
  const palette = usePalette();

  return (
    <View style={styles.wrapper}>
      <AppText variant="muted">{label}</AppText>
      <View
        style={[
          styles.inputWrap,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}>
        <AppText style={[styles.symbol, { color: palette.muted }]}>EUR</AppText>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.muted}
          style={[styles.input, { color: palette.text }]}
          value={value}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    paddingVertical: 0,
  },
  inputWrap: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 16,
  },
  symbol: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  wrapper: {
    gap: 8,
  },
});
