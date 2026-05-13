import { createTheme, alpha } from '@mui/material/styles';

const palette = {
  ink: '#111827',
  muted: '#667085',
  line: '#E5E7EB',
  canvas: '#F7F8FA',
  panel: '#FFFFFF',
  navy: '#172033',
  emerald: '#0F766E',
  mint: '#DDF7EE',
  amber: '#F59E0B',
  violet: '#7C3AED',
  danger: '#DC2626',
};

export const tokens = {
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  shadow: {
    soft: '0 1px 2px rgba(16, 24, 40, 0.06), 0 12px 28px rgba(16, 24, 40, 0.06)',
    lift: '0 18px 42px rgba(16, 24, 40, 0.12)',
  },
};

const componentOverrides = (mode) => {
  const isDark = mode === 'dark';
  const text = isDark ? '#F8FAFC' : palette.ink;
  const border = isDark ? alpha('#FFFFFF', 0.1) : palette.line;

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: isDark ? '#0B1020' : palette.canvas,
          color: text,
        },
        '*': {
          boxSizing: 'border-box',
        },
        '*::-webkit-scrollbar': {
          width: 10,
          height: 10,
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: isDark ? alpha('#FFFFFF', 0.18) : '#CBD5E1',
          borderRadius: 999,
          border: `2px solid ${isDark ? '#0B1020' : palette.canvas}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.sm,
          minHeight: 40,
          paddingInline: 16,
          textTransform: 'none',
          fontWeight: 700,
          transition: 'background-color 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease',
        },
        containedPrimary: {
          backgroundColor: palette.ink,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#0B1220',
            boxShadow: tokens.shadow.soft,
          },
        },
        outlined: {
          borderColor: border,
          color: text,
          '&:hover': {
            borderColor: isDark ? alpha('#FFFFFF', 0.2) : '#CBD5E1',
            backgroundColor: isDark ? alpha('#FFFFFF', 0.05) : '#F8FAFC',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.sm,
          backgroundColor: isDark ? alpha('#FFFFFF', 0.04) : '#FFFFFF',
          transition: 'background-color 180ms ease, box-shadow 180ms ease',
          '& fieldset': {
            borderColor: border,
          },
          '&:hover fieldset': {
            borderColor: isDark ? alpha('#FFFFFF', 0.22) : '#CBD5E1',
          },
          '&.Mui-focused fieldset': {
            borderColor: palette.emerald,
            borderWidth: 1,
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha(palette.emerald, 0.12)}`,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: isDark ? '#A8B3C7' : palette.muted,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          alignItems: 'center',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: 999,
          backgroundColor: isDark ? alpha('#FFFFFF', 0.08) : '#EEF2F6',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: tokens.radius.sm,
          fontSize: 12,
          fontWeight: 600,
        },
      },
    },
  };
};

export const getTheme = (mode = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: palette.emerald,
        light: '#14B8A6',
        dark: '#115E59',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: palette.violet,
      },
      success: {
        main: palette.emerald,
      },
      warning: {
        main: palette.amber,
      },
      error: {
        main: palette.danger,
      },
      background: {
        default: isDark ? '#0B1020' : palette.canvas,
        paper: isDark ? '#151B2A' : palette.panel,
      },
      text: {
        primary: isDark ? '#F8FAFC' : palette.ink,
        secondary: isDark ? '#A8B3C7' : palette.muted,
      },
      divider: isDark ? alpha('#FFFFFF', 0.1) : palette.line,
      surface: palette,
    },
    typography: {
      fontFamily: '"Inter", "DM Sans", "Segoe UI", system-ui, -apple-system, sans-serif',
      h1: { fontWeight: 800, letterSpacing: 0, fontSize: '2.125rem', lineHeight: 1.12 },
      h2: { fontWeight: 800, letterSpacing: 0, fontSize: '1.625rem', lineHeight: 1.2 },
      h3: { fontWeight: 800, letterSpacing: 0, fontSize: '1.25rem', lineHeight: 1.25 },
      h4: { fontWeight: 800, letterSpacing: 0, fontSize: '1.08rem', lineHeight: 1.28 },
      h5: { fontWeight: 750, letterSpacing: 0, fontSize: '1.05rem', lineHeight: 1.3 },
      h6: { fontWeight: 750, letterSpacing: 0, fontSize: '0.95rem', lineHeight: 1.35 },
      body1: { fontSize: '0.95rem', lineHeight: 1.55 },
      body2: { fontSize: '0.85rem', lineHeight: 1.5 },
      button: { letterSpacing: 0 },
    },
    shape: {
      borderRadius: tokens.radius.md,
    },
    components: componentOverrides(mode),
  });
};
