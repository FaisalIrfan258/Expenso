import { PropsWithChildren, isValidElement } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { radius } from '@/constants/design';
import { usePalette } from '@/hooks/use-palette';
import { AppText } from './AppText';

type PrimaryButtonProps = PropsWithChildren<{
  disabled?: boolean;
  onPress: () => void;
  tone?: 'primary' | 'soft';
}>;

export function PrimaryButton({ children, disabled, onPress, tone = 'primary' }: PrimaryButtonProps) {
  const palette = usePalette();
  const backgroundColor = tone === 'primary' ? palette.primary : palette.primarySoft;
  const color = tone === 'primary' ? palette.surface : palette.primary;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: disabled ? 0.42 : pressed ? 0.82 : 1 },
      ]}>
      {isValidElement(children) ? children : <AppText style={[styles.label, { color }]}>{children}</AppText>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
  },
});
