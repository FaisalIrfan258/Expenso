import { useColorScheme } from '@/hooks/use-color-scheme';
import { darkPalette, lightPalette } from '@/constants/design';

export const usePalette = () => {
  const scheme = useColorScheme();

  return scheme === 'dark' ? darkPalette : lightPalette;
};
