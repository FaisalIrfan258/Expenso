import { Pressable, StyleSheet, View } from 'react-native';

import { Category } from '@/data/categories';
import { usePalette } from '@/hooks/use-palette';
import { AppText } from './AppText';

export function CategoryPill({
  category,
  selected,
  onPress,
  selectedTextColor,
}: {
  category: Category;
  selected: boolean;
  onPress: () => void;
  selectedTextColor?: string;
}) {
  const palette = usePalette();
  const textColor = selected ? (selectedTextColor ?? '#FFFFFF') : palette.text;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: selected ? category.color : palette.surface,
          borderColor: selected ? category.color : palette.border,
        },
      ]}>
      <View style={[styles.dot, { backgroundColor: selected ? palette.surface : category.color }]} />
      <AppText style={{ color: textColor, fontWeight: '800' }}>
        {category.label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  pill: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
