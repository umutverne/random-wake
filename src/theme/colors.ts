export const colors = {
  // Primary colors
  primary: {
    main: '#6C63FF',
    light: '#9D97FF',
    dark: '#4A42CC',
  },
  // Secondary colors
  secondary: {
    main: '#FF6B9D',
    light: '#FF9DC4',
    dark: '#CC5580',
  },
  // Background colors
  dark: {
    background: '#1A1A2E',
    surface: '#16213E',
    card: '#0F3460',
    border: '#2A2A4A',
  },
  light: {
    background: '#F5F5FA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    border: '#E0E0E8',
  },
  // Text colors
  text: {
    dark: {
      primary: '#FFFFFF',
      secondary: '#B0B0C0',
      disabled: '#6A6A7A',
    },
    light: {
      primary: '#1A1A2E',
      secondary: '#5A5A6A',
      disabled: '#9A9AA0',
    },
  },
  // Status colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  // Common
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type Colors = typeof colors;
