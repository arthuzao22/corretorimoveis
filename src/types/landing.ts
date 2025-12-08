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
