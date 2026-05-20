import { StyleSheet, View } from 'react-native';

import { usePalette } from '@/hooks/use-palette';

export function ProgressBar({
  progress,
  color,
  height = 10,
}: {
  progress: number;
  color?: string;
  height?: number;
}) {
  const palette = usePalette();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.track, { backgroundColor: palette.surfaceMuted, height }]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: color ?? palette.primary,
            width: `${clamped * 100}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    borderRadius: 999,
    height: '100%',
  },
  track: {
    borderRadius: 999,
    overflow: 'hidden',
    width: '100%',
  },
});
