// Types for Landing Page Blocks

export interface LandingBloco {
  id: string
  corretorId: string
  tipo: string
  titulo: string | null
  subtitulo: string | null
  texto: string | null
  imagens: string[]
  videoUrl: string | null
  ordem: number
  ativo: boolean
  config: any
  createdAt: Date
  updatedAt: Date
}

export interface HeroBloco {
  id: string
  tipo: 'hero'
  titulo: string | null
  subtitulo: string | null
  texto: string | null
  imagens: string[]
  ordem: number
  ativo: boolean
}

export interface HistoriaBloco {
  id: string
  tipo: 'historia' | 'carrossel'
  titulo: string | null
  subtitulo: string | null
  texto: string | null
  imagens: string[]
  ordem: number
  ativo: boolean
}

export interface GaleriaBloco {
  id: string
  tipo: 'galeria'
  titulo: string | null
  subtitulo: string | null
  texto: string | null
  imagens: string[]
  ordem: number
  ativo: boolean
}

export interface CTABloco {
  id: string
  tipo: 'cta'
  titulo: string | null
  subtitulo: string | null
  texto: string | null
  imagens: string[]
  ordem: number
  ativo: boolean
}

export interface ImoveisBloco {
  id: string
  tipo: 'imoveis'
  titulo: string | null
  subtitulo: string | null
  texto: string | null
  ordem: number
  ativo: boolean
}

export interface VideoBloco {
  id: string
  tipo: 'video'
  titulo: string | null
  subtitulo: string | null
  texto: string | null
  videoUrl: string | null
  ordem: number
  ativo: boolean
}

export interface TextoBloco {
  id: string
  tipo: 'texto'
  titulo: string | null
  texto: string | null
  ordem: number
  ativo: boolean
}

export interface ContatoBloco {
  id: string
  tipo: 'contato'
  titulo: string | null
  subtitulo: string | null
  texto: string | null
  ordem: number
  ativo: boolean
}

export type BlocoType = 
  | HeroBloco 
  | HistoriaBloco 
  | GaleriaBloco 
  | CTABloco 
  | ImoveisBloco 
  | VideoBloco 
  | TextoBloco 
  | ContatoBloco

// ===================================
// LANDING PAGE THEME TYPES
// ===================================

export interface LandingThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  heading: string
  muted: string
}

export interface LandingThemeTypography {
  headingFont: string
  bodyFont: string
  headingWeight: '400' | '500' | '600' | '700' | '800'
  bodyWeight: '400' | '500' | '600'
}

export interface LandingThemeSpacing {
  sectionPadding: 'compact' | 'normal' | 'spacious'
  contentWidth: 'narrow' | 'normal' | 'wide' | 'full'
}

export interface LandingThemeStyle {
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  shadow: 'none' | 'sm' | 'md' | 'lg'
  buttonStyle: 'solid' | 'outline' | 'ghost'
}

export interface LandingTheme {
  id: string
  name: string
  colors: LandingThemeColors
  typography: LandingThemeTypography
  spacing: LandingThemeSpacing
  style: LandingThemeStyle
}

// Temas pré-definidos
export const landingThemePresets: Record<string, LandingTheme> = {
  'modern-blue': {
    id: 'modern-blue',
    name: 'Moderno Azul',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#60A5FA',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#374151',
      heading: '#111827',
      muted: '#9CA3AF',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
    },
    spacing: {
      sectionPadding: 'normal',
      contentWidth: 'normal',
    },
    style: {
      borderRadius: 'lg',
      shadow: 'md',
      buttonStyle: 'solid',
    },
  },
  'elegant-gold': {
    id: 'elegant-gold',
    name: 'Elegante Dourado',
    colors: {
      primary: '#B45309',
      secondary: '#78350F',
      accent: '#D97706',
      background: '#FFFBEB',
      surface: '#FEF3C7',
      text: '#451A03',
      heading: '#78350F',
      muted: '#92400E',
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Inter',
      headingWeight: '600',
      bodyWeight: '400',
    },
    spacing: {
      sectionPadding: 'spacious',
      contentWidth: 'normal',
    },
    style: {
      borderRadius: 'sm',
      shadow: 'sm',
      buttonStyle: 'solid',
    },
  },
  'minimal-dark': {
    id: 'minimal-dark',
    name: 'Minimal Escuro',
    colors: {
      primary: '#FFFFFF',
      secondary: '#A1A1AA',
      accent: '#22C55E',
      background: '#18181B',
      surface: '#27272A',
      text: '#D4D4D8',
      heading: '#FFFFFF',
      muted: '#71717A',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      headingWeight: '600',
      bodyWeight: '400',
    },
    spacing: {
      sectionPadding: 'normal',
      contentWidth: 'narrow',
    },
    style: {
      borderRadius: 'md',
      shadow: 'none',
      buttonStyle: 'outline',
    },
  },
  'bold-purple': {
    id: 'bold-purple',
    name: 'Ousado Roxo',
    colors: {
      primary: '#7C3AED',
      secondary: '#5B21B6',
      accent: '#A78BFA',
      background: '#FAF5FF',
      surface: '#EDE9FE',
      text: '#4C1D95',
      heading: '#5B21B6',
      muted: '#8B5CF6',
    },
    typography: {
      headingFont: 'Poppins',
      bodyFont: 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
    },
    spacing: {
      sectionPadding: 'spacious',
      contentWidth: 'wide',
    },
    style: {
      borderRadius: 'xl',
      shadow: 'lg',
      buttonStyle: 'solid',
    },
  },
  'green-nature': {
    id: 'green-nature',
    name: 'Verde Natureza',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10B981',
      background: '#ECFDF5',
      surface: '#D1FAE5',
      text: '#064E3B',
      heading: '#047857',
      muted: '#6EE7B7',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      headingWeight: '600',
      bodyWeight: '400',
    },
    spacing: {
      sectionPadding: 'normal',
      contentWidth: 'normal',
    },
    style: {
      borderRadius: 'lg',
      shadow: 'sm',
      buttonStyle: 'solid',
    },
  },
  'coral-warm': {
    id: 'coral-warm',
    name: 'Coral Acolhedor',
    colors: {
      primary: '#F43F5E',
      secondary: '#BE123C',
      accent: '#FB7185',
      background: '#FFF1F2',
      surface: '#FFE4E6',
      text: '#881337',
      heading: '#BE123C',
      muted: '#FDA4AF',
    },
    typography: {
      headingFont: 'Poppins',
      bodyFont: 'Inter',
      headingWeight: '600',
      bodyWeight: '400',
    },
    spacing: {
      sectionPadding: 'normal',
      contentWidth: 'normal',
    },
    style: {
      borderRadius: 'xl',
      shadow: 'md',
      buttonStyle: 'solid',
    },
  },
}

// Fontes disponíveis para personalização
export const availableFonts = [
  { value: 'Inter', label: 'Inter (Moderna)' },
  { value: 'Poppins', label: 'Poppins (Arredondada)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegante)' },
  { value: 'Roboto', label: 'Roboto (Clássica)' },
  { value: 'Open Sans', label: 'Open Sans (Limpa)' },
  { value: 'Montserrat', label: 'Montserrat (Geométrica)' },
  { value: 'Lato', label: 'Lato (Humanista)' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro (Profissional)' },
]

// Helper para gerar CSS customizado baseado no tema
export function generateThemeCSS(theme: LandingTheme): string {
  const radiusMap = {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  }
  
  const shadowMap = {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  }
  
  const paddingMap = {
    compact: '3rem',
    normal: '5rem',
    spacious: '8rem',
  }
  
  const widthMap = {
    narrow: '48rem',
    normal: '64rem',
    wide: '80rem',
    full: '100%',
  }

  return `
    :root {
      --landing-primary: ${theme.colors.primary};
      --landing-secondary: ${theme.colors.secondary};
      --landing-accent: ${theme.colors.accent};
      --landing-background: ${theme.colors.background};
      --landing-surface: ${theme.colors.surface};
      --landing-text: ${theme.colors.text};
      --landing-heading: ${theme.colors.heading};
      --landing-muted: ${theme.colors.muted};
      --landing-heading-font: '${theme.typography.headingFont}', sans-serif;
      --landing-body-font: '${theme.typography.bodyFont}', sans-serif;
      --landing-heading-weight: ${theme.typography.headingWeight};
      --landing-body-weight: ${theme.typography.bodyWeight};
      --landing-border-radius: ${radiusMap[theme.style.borderRadius]};
      --landing-shadow: ${shadowMap[theme.style.shadow]};
      --landing-section-padding: ${paddingMap[theme.spacing.sectionPadding]};
      --landing-content-width: ${widthMap[theme.spacing.contentWidth]};
    }
  `
}
