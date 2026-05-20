import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

import { usePalette } from '@/hooks/use-palette';
import { AppText } from './AppText';

type Slice = {
  amount: number;
  color: string;
};

export function PieChart({ slices, total }: { slices: Slice[]; total: number }) {
  const palette = usePalette();
  const size = 164;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View style={styles.wrap}>
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke={palette.surfaceMuted}
          strokeWidth={strokeWidth}
        />
        {slices.map((slice, index) => {
          const percent = total > 0 ? slice.amount / total : 0;
          const dash = percent * circumference;
          const currentOffset = offset;
          offset += dash;

          return (
            <Circle
              key={`${slice.color}-${index}`}
              cx={size / 2}
              cy={size / 2}
              fill="transparent"
              originX={size / 2}
              originY={size / 2}
              r={radius}
              rotation="-90"
              stroke={slice.color}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-currentOffset}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
            />
          );
        })}
      </Svg>
      <View style={styles.center}>
        <AppText variant="eyebrow">Spent</AppText>
        <AppText variant="heading">{Math.round(total)} EUR</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    gap: 2,
    position: 'absolute',
  },
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
