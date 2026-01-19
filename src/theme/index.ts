import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';
import { colors } from './colors';
import type { ThemeMode } from '../types';

const fontConfig = {
  displayLarge: { fontFamily: 'System', fontSize: 57, fontWeight: '400' as const },
  displayMedium: { fontFamily: 'System', fontSize: 45, fontWeight: '400' as const },
  displaySmall: { fontFamily: 'System', fontSize: 36, fontWeight: '400' as const },
  headlineLarge: { fontFamily: 'System', fontSize: 32, fontWeight: '400' as const },
  headlineMedium: { fontFamily: 'System', fontSize: 28, fontWeight: '400' as const },
  headlineSmall: { fontFamily: 'System', fontSize: 24, fontWeight: '400' as const },
  titleLarge: { fontFamily: 'System', fontSize: 22, fontWeight: '500' as const },
  titleMedium: { fontFamily: 'System', fontSize: 16, fontWeight: '500' as const },
  titleSmall: { fontFamily: 'System', fontSize: 14, fontWeight: '500' as const },
  bodyLarge: { fontFamily: 'System', fontSize: 16, fontWeight: '400' as const },
  bodyMedium: { fontFamily: 'System', fontSize: 14, fontWeight: '400' as const },
  bodySmall: { fontFamily: 'System', fontSize: 12, fontWeight: '400' as const },
  labelLarge: { fontFamily: 'System', fontSize: 14, fontWeight: '500' as const },
  labelMedium: { fontFamily: 'System', fontSize: 12, fontWeight: '500' as const },
  labelSmall: { fontFamily: 'System', fontSize: 11, fontWeight: '500' as const },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary.main,
    primaryContainer: colors.primary.dark,
    secondary: colors.secondary.main,
    secondaryContainer: colors.secondary.dark,
    background: colors.dark.background,
    surface: colors.dark.surface,
    surfaceVariant: colors.dark.card,
    error: colors.error,
    onPrimary: colors.white,
    onSecondary: colors.white,
    onBackground: colors.text.dark.primary,
    onSurface: colors.text.dark.primary,
    onSurfaceVariant: colors.text.dark.secondary,
    outline: colors.dark.border,
    elevation: {
      level0: 'transparent',
      level1: colors.dark.surface,
      level2: colors.dark.card,
      level3: colors.dark.card,
      level4: colors.dark.card,
      level5: colors.dark.card,
    },
  },
  fonts: configureFonts({ config: fontConfig }),
  custom: {
    colors: colors,
  },
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.main,
    primaryContainer: colors.primary.light,
    secondary: colors.secondary.main,
    secondaryContainer: colors.secondary.light,
    background: colors.light.background,
    surface: colors.light.surface,
    surfaceVariant: colors.light.card,
    error: colors.error,
    onPrimary: colors.white,
    onSecondary: colors.white,
    onBackground: colors.text.light.primary,
    onSurface: colors.text.light.primary,
    onSurfaceVariant: colors.text.light.secondary,
    outline: colors.light.border,
    elevation: {
      level0: 'transparent',
      level1: colors.light.surface,
      level2: colors.light.card,
      level3: colors.light.card,
      level4: colors.light.card,
      level5: colors.light.card,
    },
  },
  fonts: configureFonts({ config: fontConfig }),
  custom: {
    colors: colors,
  },
};

export const getTheme = (mode: ThemeMode) => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

export type AppTheme = typeof darkTheme;
