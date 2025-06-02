// Global styles and constants for the 1337 Event Management app
import { Platform } from 'react-native';

export const Colors = {
  primary: '#1987B5',
  primaryDark: '#0C3A61',
  secondary: '#f8f9fa',
  background: '#f8f9fa',
  white: '#ffffff',
  black: '#000000',
  text: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#e0e0e0',
  shadow: '#000000',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF8C00',
  lightGray: '#f5f5f5',
  lightBlue: '#F0F8FF',
  // Profile gradient colors from SVG
  gradientStart: '#1987B5',
  gradientEnd: '#0C3A61',
};

export const Fonts = {
  family: 'Unbounded-Regular', // Default font family
  // Platform-specific font families for different weights
  getFontFamily: (weight = 'regular') => {
    // Now we have individual font files for each weight
    switch (weight) {
      case 'extralight':
      case '200':
        return 'Unbounded-ExtraLight';
      case 'light':
      case '300':
        return 'Unbounded-Light';
      case 'regular':
      case '400':
        return 'Unbounded-Regular';
      case 'medium':
      case '500':
        return 'Unbounded-Medium';
      case 'semibold':
      case '600':
        return 'Unbounded-SemiBold';
      case 'bold':
      case '700':
        return 'Unbounded-Bold';
      case 'extrabold':
      case '800':
        return 'Unbounded-ExtraBold';
      case 'black':
      case '900':
        return 'Unbounded-Black';
      default:
        return 'Unbounded-Regular';
    }
  },
  // Get proper font weight for platform - now we use normal since weight is in font family
  getFontWeight: (weight = 'regular') => {
    // Since we're using individual font files, we always use 'normal' fontWeight
    // The actual weight is embedded in the font family name
    return 'normal';
  },
  sizes: {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 18,
    xxlarge: 24,
    title: 28,
    logo: 48,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  huge: 40,
  massive: 50,
};

export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 15,
  xlarge: 20,
  circle: 50,
};

export const Shadows = {
  light: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  medium: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
};
