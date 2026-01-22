/**
 * Design System - Fonte de Verdade baseada na tela de Kanban
 * Todas as telas devem seguir estes padrões visuais.
 */

// ===================================
// CORES - Paleta Principal
// ===================================
export const colors = {
  // Primárias
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',  // Cor principal (indigo)
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  
  // Secundárias
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  
  // Feedback
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },
  
  // Prioridades (Lead)
  priority: {
    baixa: '#60A5FA',    // blue-400
    media: '#FBBF24',    // yellow-400
    alta: '#FB923C',     // orange-400
    urgente: '#EF4444',  // red-500
  },
  
  // Backgrounds
  background: {
    page: '#F9FAFB',     // gray-50
    card: '#FFFFFF',
    input: '#F9FAFB',
    inputFocus: '#FFFFFF',
    hover: '#F3F4F6',    // gray-100
    selected: '#EEF2FF', // indigo-50
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Bordas
  border: {
    light: '#F3F4F6',    // gray-100
    default: '#E5E7EB',  // gray-200
    focus: '#6366F1',    // indigo-500
  },
  
  // Texto
  text: {
    primary: '#111827',   // gray-900
    secondary: '#6B7280', // gray-500
    muted: '#9CA3AF',     // gray-400
    inverse: '#FFFFFF',
    link: '#4F46E5',      // indigo-600
    linkHover: '#4338CA', // indigo-700
  },
} as const

// ===================================
// TIPOGRAFIA
// ===================================
export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  
  fontSize: {
    xs: '0.625rem',      // 10px
    sm: '0.75rem',       // 12px
    base: '0.875rem',    // 14px
    md: '1rem',          // 16px
    lg: '1.125rem',      // 18px
    xl: '1.25rem',       // 20px
    '2xl': '1.5rem',     // 24px
    '3xl': '1.875rem',   // 30px
    '4xl': '2.25rem',    // 36px
    '5xl': '3rem',       // 48px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const

// ===================================
// ESPAÇAMENTOS
// ===================================
export const spacing = {
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
} as const

// ===================================
// BORDAS E RAIOS
// ===================================
export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const

// ===================================
// SOMBRAS
// ===================================
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  // Sombras específicas do Kanban
  card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  cardHover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  cardDragging: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
} as const

// ===================================
// TRANSIÇÕES E ANIMAÇÕES
// ===================================
export const transitions = {
  fast: '150ms',
  default: '200ms',
  slow: '300ms',
  slower: '500ms',
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

// ===================================
// BREAKPOINTS (Responsividade)
// ===================================
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ===================================
// Z-INDEX
// ===================================
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
} as const

// ===================================
// CLASSES UTILITÁRIAS (Tailwind)
// ===================================
export const tailwindClasses = {
  // Cards (padrão Kanban)
  card: {
    base: 'bg-white rounded-xl shadow-sm border border-gray-100',
    hover: 'hover:shadow-md transition-all duration-200',
    active: 'shadow-lg',
    dragging: 'shadow-lg rotate-2 scale-105',
  },
  
  // Inputs (padrão Kanban)
  input: {
    base: 'w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800',
    focus: 'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent',
    placeholder: 'placeholder:text-gray-400',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100',
  },
  
  // Botões (padrão Kanban)
  button: {
    base: 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
    sizes: {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    },
    variants: {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
      outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100',
      ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    },
  },
  
  // Badge (padrão Kanban)
  badge: {
    base: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
    variants: {
      default: 'bg-gray-100 text-gray-700 border border-gray-200',
      primary: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
      success: 'bg-green-50 text-green-700 border border-green-100',
      warning: 'bg-orange-50 text-orange-700 border border-orange-100',
      danger: 'bg-red-50 text-red-700 border border-red-100',
      info: 'bg-blue-50 text-blue-700 border border-blue-100',
    },
  },
  
  // Containers
  container: {
    page: 'min-h-screen bg-gray-50',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-8 lg:py-12',
  },
  
  // Sidebar Navigation
  navigation: {
    item: 'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
    itemDefault: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
    itemActive: 'bg-indigo-50 text-indigo-600 font-medium',
  },
  
  // Headers/Titles
  heading: {
    h1: 'text-2xl lg:text-3xl font-bold text-gray-900',
    h2: 'text-xl lg:text-2xl font-bold text-gray-800',
    h3: 'text-lg font-semibold text-gray-800',
    h4: 'text-base font-semibold text-gray-700',
    subtitle: 'text-sm text-gray-500',
  },
  
  // Layout Header (padrão Kanban)
  pageHeader: {
    wrapper: 'bg-white border-b border-gray-200 p-4 lg:p-6',
    title: 'text-xl lg:text-2xl font-bold text-gray-800',
    subtitle: 'text-sm text-gray-500 mt-1',
    actions: 'flex items-center gap-2 lg:gap-3',
  },
  
  // Filter Bar (padrão Kanban)
  filterBar: {
    wrapper: 'flex flex-col md:flex-row gap-3 p-4 bg-white border-b border-gray-200',
    search: 'flex-1 relative',
    searchIcon: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400',
    select: 'px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-white transition-colors',
  },
  
  // Modal
  modal: {
    backdrop: 'fixed inset-0 bg-black/50 z-40 backdrop-blur-sm',
    container: 'fixed inset-0 z-50 flex items-center justify-center p-4',
    content: 'bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden',
    header: 'flex items-center justify-between p-6 border-b border-gray-100',
    body: 'p-6 overflow-y-auto',
    footer: 'flex items-center justify-end gap-3 p-6 border-t border-gray-100',
  },
  
  // Empty State
  emptyState: {
    wrapper: 'flex flex-col items-center justify-center py-12 px-4 text-center',
    icon: 'w-16 h-16 text-gray-300 mb-4',
    title: 'text-lg font-semibold text-gray-700 mb-2',
    description: 'text-sm text-gray-500 max-w-md',
  },
  
  // Loading State
  skeleton: {
    base: 'animate-pulse bg-gray-200 rounded',
    text: 'h-4 bg-gray-200 rounded',
    avatar: 'w-10 h-10 bg-gray-200 rounded-full',
    card: 'h-32 bg-gray-200 rounded-xl',
  },
} as const

// ===================================
// LANDING PAGE - Temas Personalizáveis
// ===================================
export interface LandingTheme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    heading: string
  }
  typography: {
    headingFont: string
    bodyFont: string
  }
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  style: 'minimal' | 'modern' | 'elegant' | 'bold'
}

export const defaultLandingThemes: LandingTheme[] = [
  {
    id: 'modern-blue',
    name: 'Moderno Azul',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#60A5FA',
      background: '#FFFFFF',
      text: '#374151',
      heading: '#111827',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
    },
    borderRadius: 'lg',
    style: 'modern',
  },
  {
    id: 'elegant-gold',
    name: 'Elegante Dourado',
    colors: {
      primary: '#B45309',
      secondary: '#78350F',
      accent: '#D97706',
      background: '#FFFBEB',
      text: '#451A03',
      heading: '#78350F',
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Inter',
    },
    borderRadius: 'sm',
    style: 'elegant',
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Escuro',
    colors: {
      primary: '#FFFFFF',
      secondary: '#A1A1AA',
      accent: '#22C55E',
      background: '#18181B',
      text: '#D4D4D8',
      heading: '#FFFFFF',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
    },
    borderRadius: 'md',
    style: 'minimal',
  },
  {
    id: 'bold-purple',
    name: 'Ousado Roxo',
    colors: {
      primary: '#7C3AED',
      secondary: '#5B21B6',
      accent: '#A78BFA',
      background: '#FAF5FF',
      text: '#4C1D95',
      heading: '#5B21B6',
    },
    typography: {
      headingFont: 'Poppins',
      bodyFont: 'Inter',
    },
    borderRadius: 'xl',
    style: 'bold',
  },
]

// ===================================
// HELPER FUNCTIONS
// ===================================
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getInputClasses(): string {
  return cn(
    tailwindClasses.input.base,
    tailwindClasses.input.focus,
    tailwindClasses.input.placeholder,
    tailwindClasses.input.disabled
  )
}

export function getButtonClasses(
  variant: keyof typeof tailwindClasses.button.variants = 'primary',
  size: keyof typeof tailwindClasses.button.sizes = 'md'
): string {
  return cn(
    tailwindClasses.button.base,
    tailwindClasses.button.sizes[size],
    tailwindClasses.button.variants[variant]
  )
}

export function getCardClasses(isHoverable = true): string {
  return cn(
    tailwindClasses.card.base,
    isHoverable && tailwindClasses.card.hover
  )
}

export function getBadgeClasses(
  variant: keyof typeof tailwindClasses.badge.variants = 'default'
): string {
  return cn(
    tailwindClasses.badge.base,
    tailwindClasses.badge.variants[variant]
  )
}
