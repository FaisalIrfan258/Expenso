import { PropsWithChildren, useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePalette } from '@/hooks/use-palette';

type AppScreenProps = PropsWithChildren<{
  scroll?: boolean;
}>;

export function AppScreen({ children, scroll = true }: AppScreenProps) {
  const palette = usePalette();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      duration: 360,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  const content = (
    <Animated.View
      style={[
        styles.content,
        {
          opacity: fade,
          transform: [
            {
              translateY: fade.interpolate({
                inputRange: [0, 1],
                outputRange: [14, 0],
              }),
            },
          ],
        },
      ]}>
      {children}
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.orb, { backgroundColor: palette.primarySoft }]} />
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: 18,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },
  orb: {
    borderRadius: 140,
    height: 280,
    opacity: 0.72,
    position: 'absolute',
    right: -110,
    top: -130,
    width: 280,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
