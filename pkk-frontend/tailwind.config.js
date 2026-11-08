import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'

const jakarta = ['Plus Jakarta Sans', 'sans-serif']

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'outline-variant': '#e6bdb8', 'on-tertiary-container': '#fff7f1',
        'surface-bright': '#f8f9fb', 'surface-container-highest': '#e1e2e4',
        'secondary-fixed': '#d9e3f6', error: '#ba1a1a', 'inverse-primary': '#ffb4ab',
        'on-error': '#ffffff', 'tertiary-fixed': '#ffddb8', 'error-container': '#ffdad6',
        'on-tertiary-fixed': '#2a1700', 'on-error-container': '#93000a',
        'on-secondary-container': '#596373', 'on-secondary-fixed': '#121c2a',
        'on-primary-fixed-variant': '#93000b', 'on-background': '#191c1e',
        'on-primary': '#ffffff', 'tertiary-container': '#a06500', background: '#f8f9fb',
        'surface-variant': '#e1e2e4', 'surface-tint': '#bf0715', 'on-surface': '#191c1e',
        'surface-container-low': '#f3f4f6', 'surface-container-high': '#e7e8ea',
        tertiary: '#7f4f00', 'on-primary-fixed': '#410002', 'secondary-fixed-dim': '#bdc7d9',
        'on-tertiary-fixed-variant': '#653e00', 'surface-dim': '#d9dadc',
        'primary-container': '#dc2626', 'primary-fixed': '#ffdad6', surface: '#f8f9fb',
        'on-primary-container': '#fff6f5', 'secondary-container': '#d6e0f3',
        'tertiary-fixed-dim': '#ffb95f', 'surface-container-lowest': '#ffffff',
        'surface-container': '#edeef0', 'inverse-on-surface': '#f0f1f3', primary: '#b70011',
        secondary: '#555f6f', 'on-tertiary': '#ffffff', 'on-secondary': '#ffffff',
        'inverse-surface': '#2e3132', 'on-secondary-fixed-variant': '#3d4756',
        outline: '#916f6b', 'primary-fixed-dim': '#ffb4ab',
      },
      borderRadius: { DEFAULT: '0.25rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
      spacing: {
        'gutter-lg': '2rem', 'gutter-md': '1.5rem', 'space-lg': '1.5rem', 'space-xs': '0.25rem',
        'space-md': '1rem', 'margin-lg': '3rem', gutter: '1rem', 'space-xl': '2.5rem',
        margin: '1rem', 'space-sm': '0.5rem', 'margin-md': '2rem',
      },
      fontFamily: Object.fromEntries(
        ['label-sm', 'display-lg', 'display-lg-mobile', 'currency-md', 'body-sm', 'headline-lg',
         'headline-lg-mobile', 'body-lg', 'headline-sm', 'headline-md', 'label-md', 'body-md', 'label-lg',
        ].map((k) => [k, jakarta])
      ),
      fontSize: {
        'label-sm': ['11px', { lineHeight: '14px', letterSpacing: '0.03em', fontWeight: '700' }],
        'display-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg-mobile': ['30px', { lineHeight: '38px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'currency-md': ['16px', { lineHeight: '20px', fontWeight: '700' }],
        'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'headline-lg': ['28px', { lineHeight: '36px', letterSpacing: '-0.015em', fontWeight: '700' }],
        'headline-lg-mobile': ['22px', { lineHeight: '30px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'headline-sm': ['16px', { lineHeight: '24px', fontWeight: '700' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '700' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '600' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '600' }],
      },
    },
  },
  plugins: [forms, containerQueries],
}