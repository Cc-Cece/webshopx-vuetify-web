/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com
 */

// Composables
import { createVuetify } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Component Imports for Aliases
import { VChip, VBtn, VSwitch } from 'vuetify/components'

// Official Themes
const light = {
  dark: false,
  colors: {
    'surface-variant-alt': '#dedede',
    primary: '#1867c0',
    secondary: '#5CBBF6',
    tertiary: '#E57373',
    accent: '#005CAF',
    quarternary: '#B0D1E8',
    'surface-bright': '#fafafa',
  },
}

const dark = {
  dark: true,
  colors: {
    'surface-variant-alt': '#333333',
    primary: '#2196F3',
    secondary: '#424242',
    tertiary: '#E57373',
    accent: '#FF4081',
    quarternary: '#B0D1E8',
    'surface-bright': '#474747',
  },
}

const blackguard = {
  dark: true,
  colors: {
    background: '#0f0c24',
    primary: '#e7810d',
    surface: '#1e184a',
    'on-surface-variant': '#4c219e',
    info: '#9c27b0',
    accent: '#FF4081',
    success: '#84b38a',
    'surface-bright': '#362b89',
  },
  variables: {
    'theme-code': '#15123d',
  },
}

const midnightSakura = {
  dark: true,
  colors: {
    background: '#0d0b21',
    surface: '#17152f',
    primary: '#ff79c6',
    secondary: '#8be9fd',
    accent: '#bd93f9',
    info: '#8be9fd',
    success: '#50fa7b',
    warning: '#f1fa8c',
    error: '#ff5555',
    'surface-bright': '#232044',
    'surface-variant-alt': '#2a274e',
  },
  variables: {
    'theme-code': '#13112c',
  },
}

const themeNames = ['light', 'dark', 'blackguard', 'midnightSakura'] as const
const storedTheme = typeof window !== 'undefined'
  ? window.localStorage.getItem('webshopx_theme')
  : null
const defaultTheme: (typeof themeNames)[number] = themeNames.includes(storedTheme as (typeof themeNames)[number])
  ? (storedTheme as (typeof themeNames)[number])
  : 'light'

export default createVuetify({
  aliases: {
    BorderChip: VChip,
    NewInChip: VChip,
    CodemodChip: VChip,
    PageFeatureChip: VChip,
    PrimaryBtn: VBtn,
    SettingsSwitch: VSwitch,
  },
  defaults: {
    global: {
      eager: false,
    },
    NewInChip: {
      appendIcon: 'mdi-page-next',
      class: 'ms-2 text-mono',
      color: 'success',
      label: true,
      size: 'small',
      tag: 'div',
      variant: 'flat',

      VIcon: {
        class: 'ms-2',
        size: 'small',
      },
    },
    CodemodChip: {
      class: 'text-mono',
      color: 'info',
      size: 'small',
      variant: 'flat',
      label: true,
    },
    PageFeatureChip: {
      variant: 'tonal',
      border: true,
      class: 'text-medium-emphasis me-2 mb-2',
      size: 'small',
    },
    PrimaryBtn: {
      border: true,
      class: 'text-none',
      color: 'primary',
      slim: true,
      size: 'small',
      variant: 'outlined',

      VProgressCircular: {
        indeterminate: true,
        size: 16,
        width: 1,
      },
    },
    SettingsSwitch: {
      class: 'settings-switch',
      color: 'primary',
      density: 'compact',
      inset: true,
      trueIcon: 'mdi-check',
      falseIcon: '$close',
      hideDetails: 'auto',
    },
    BorderChip: {
      border: true,
      label: true,
      size: 'small',
      variant: 'text',

      VIcon: {
        color: 'medium-emphasis',
        size: 'small',
      },
    },
  },
  theme: {
    defaultTheme,
    themes: {
      light,
      dark,
      blackguard,
      midnightSakura,
    },
  },
})
