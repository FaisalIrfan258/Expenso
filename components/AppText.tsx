import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';

import { usePalette } from '@/hooks/use-palette';

type AppTextProps = PropsWithChildren<{
  variant?: 'eyebrow' | 'title' | 'heading' | 'body' | 'muted' | 'metric';
  style?: StyleProp<TextStyle>;
}>;

export function AppText({ children, variant = 'body', style }: AppTextProps) {
  const palette = usePalette();
  const color = variant === 'muted' || variant === 'eyebrow' ? palette.muted : palette.text;

  return <Text style={[styles.base, styles[variant], { color }, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  metric: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.4,
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1.4,
    lineHeight: 42,
  },
});
