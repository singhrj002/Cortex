import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50:  '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  background: {
    primary: '#09090C',
    surface:  '#111116',
    raised:   '#18181F',
    overlay:  '#1F1F2A',
  },
  border: {
    subtle:  '#27272A',
    default: '#3F3F46',
    strong:  '#52525B',
  },
  text: {
    primary:   '#FAFAFA',
    secondary: '#A1A1AA',
    muted:     '#71717A',
    disabled:  '#52525B',
  },
  semantic: {
    decision:  '#A78BFA',
    task:      '#34D399',
    conflict:  '#F87171',
    risk:      '#FBBF24',
    info:      '#60A5FA',
    success:   '#34D399',
    warning:   '#FBBF24',
    error:     '#F87171',
  },
};

const fonts = {
  heading: '"Plus Jakarta Sans", system-ui, sans-serif',
  body:    '"Plus Jakarta Sans", system-ui, sans-serif',
  mono:    '"JetBrains Mono", "Fira Code", monospace',
};

const styles = {
  global: {
    '*, *::before, *::after': {
      borderColor: '#27272A',
    },
    body: {
      bg:    'background.primary',
      color: 'text.primary',
      lineHeight: '1.6',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    '::-webkit-scrollbar': { width: '5px' },
    '::-webkit-scrollbar-track': { background: '#09090C' },
    '::-webkit-scrollbar-thumb': { background: '#3F3F46', borderRadius: '3px' },
    '::-webkit-scrollbar-thumb:hover': { background: '#52525B' },
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: 'lg',
      letterSpacing: '-0.01em',
      transition: 'all 0.15s ease',
    },
    variants: {
      solid: {
        bg: 'brand.600',
        color: 'white',
        _hover: {
          bg: 'brand.500',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
        },
        _active: { bg: 'brand.700', transform: 'translateY(0)' },
      },
      outline: {
        borderColor: 'border.subtle',
        color: 'text.secondary',
        _hover: { bg: 'background.raised', borderColor: 'border.default', color: 'text.primary' },
      },
      ghost: {
        color: 'text.secondary',
        _hover: { bg: 'background.raised', color: 'text.primary' },
      },
    },
    defaultProps: { variant: 'solid' },
  },

  Card: {
    baseStyle: {
      container: {
        background:   'background.surface',
        borderRadius: 'xl',
        border:       '1px solid',
        borderColor:  'border.subtle',
      },
    },
  },

  Modal: {
    baseStyle: {
      dialog: {
        bg:           'background.surface',
        borderRadius: '2xl',
        border:       '1px solid',
        borderColor:  'border.subtle',
        boxShadow:    '0 25px 60px rgba(0,0,0,0.8)',
      },
      header: { color: 'text.primary', pb: 2 },
      body:   { color: 'text.secondary' },
      closeButton: {
        color:  'text.muted',
        _hover: { bg: 'background.raised', color: 'text.primary' },
      },
    },
  },

  Badge: {
    baseStyle: {
      borderRadius: 'full',
      fontWeight:   '600',
      fontSize:     '10px',
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    },
  },

  Input: {
    variants: {
      outline: {
        field: {
          bg:           'background.raised',
          borderColor:  'border.subtle',
          color:        'text.primary',
          _placeholder: { color: 'text.muted' },
          _hover:  { borderColor: 'border.default' },
          _focus:  { borderColor: 'brand.500', boxShadow: '0 0 0 1px #8B5CF6' },
        },
      },
    },
    defaultProps: { variant: 'outline' },
  },

  Select: {
    variants: {
      outline: {
        field: {
          bg:          'background.raised',
          borderColor: 'border.subtle',
          color:       'text.primary',
          _hover:  { borderColor: 'border.default' },
          _focus:  { borderColor: 'brand.500', boxShadow: '0 0 0 1px #8B5CF6' },
        },
        icon: { color: 'text.muted' },
      },
    },
    defaultProps: { variant: 'outline' },
  },

  Divider: {
    baseStyle: { borderColor: 'border.subtle', opacity: 1 },
  },

  Tooltip: {
    baseStyle: {
      bg:          'background.overlay',
      color:       'text.primary',
      borderRadius: 'md',
      border:      '1px solid',
      borderColor: 'border.subtle',
      fontSize:    'xs',
      px: 2,
      py: 1,
    },
  },

  Tag: {
    baseStyle: {
      container: {
        bg:          'background.raised',
        borderRadius: 'full',
        border:      '1px solid',
        borderColor: 'border.subtle',
        color:       'text.secondary',
      },
    },
  },
};

const theme = extendTheme({
  colors,
  fonts,
  styles,
  components,
  config: {
    initialColorMode:   'dark',
    useSystemColorMode: false,
  },
  radii: {
    sm:    '6px',
    md:    '8px',
    lg:    '10px',
    xl:    '14px',
    '2xl': '18px',
  },
  shadows: {
    sm:   '0 1px 3px rgba(0,0,0,0.4)',
    md:   '0 4px 16px rgba(0,0,0,0.5)',
    lg:   '0 8px 32px rgba(0,0,0,0.6)',
    glow: '0 0 24px rgba(139,92,246,0.25)',
  },
});

export default theme;
