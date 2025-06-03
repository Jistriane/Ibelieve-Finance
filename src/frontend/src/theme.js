import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#E6FFFA',
      100: '#B2F5EA',
      200: '#81E6D9',
      300: '#4FD1C5',
      400: '#38B2AC',
      500: '#319795',
      600: '#2C7A7B',
      700: '#285E61',
      800: '#234E52',
      900: '#1D4044',
    },
    accent: {
      50: '#FFE5F1',
      100: '#FFB8D9',
      200: '#FF8AC1',
      300: '#FF5CA9',
      400: '#FF2E91',
      500: '#FF0079',
      600: '#CC0061',
      700: '#990049',
      800: '#660031',
      900: '#330019',
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'xl',
        transition: 'all 0.3s',
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: 'xl',
        },
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
        gradient: {
          bgGradient: 'linear(to-r, brand.500, accent.500)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, brand.600, accent.600)',
          },
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.2)',
          },
        },
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            borderRadius: 'xl',
            bg: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            _hover: {
              bg: 'rgba(255, 255, 255, 0.15)',
            },
            _focus: {
              bg: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'brand.500',
            },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Box: {
      baseStyle: {
        borderRadius: 'xl',
        transition: 'all 0.3s',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          bg: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'xl',
          },
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'white',
        backgroundImage: 'linear-gradient(45deg, #1a202c 0%, #2d3748 100%)',
        backgroundAttachment: 'fixed',
      },
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

export default theme;
