import { z } from 'zod'

// User validators
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  phone: z.string().optional(),
})

// Imovel validators
export const imovelSchema = z.object({
  titulo: z.string().min(5, 'Título deve ter no mínimo 5 caracteres'),
  descricao: z.string().min(20, 'Descrição deve ter no mínimo 20 caracteres'),
  tipo: z.enum(['VENDA', 'ALUGUEL'], {
    message: 'Tipo inválido',
  }),
  status: z.enum(['ATIVO', 'INATIVO', 'VENDIDO', 'ALUGADO']).optional(),
  valor: z.number().positive('Valor deve ser maior que zero'),
  endereco: z.string().min(5, 'Endereço inválido'),
  cidade: z.string().min(2, 'Cidade inválida'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  cep: z.string().optional(),
  bairro: z.string().optional(),
  quartos: z.number().int().min(0).optional(),
  banheiros: z.number().int().min(0).optional(),
  area: z.number().positive().optional(),
  garagem: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  destaque: z.boolean().optional(),
})

export const imovelSearchSchema = z.object({
  tipo: z.enum(['VENDA', 'ALUGUEL', 'TODOS']).optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  valorMin: z.number().optional(),
  valorMax: z.number().optional(),
  quartos: z.number().optional(),
  banheiros: z.number().optional(),
  areaMin: z.number().optional(),
  areaMax: z.number().optional(),
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().max(100).optional(),
})

// Lead validators
export const leadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(10, 'Telefone inválido'),
  message: z.string().optional(),
  imovelId: z.string().optional(),
})

export const leadUpdateSchema = z.object({
  status: z.enum(['NOVO', 'CONTATADO', 'QUALIFICADO', 'NEGOCIACAO', 'CONVERTIDO', 'PERDIDO']),
  anotacoes: z.string().optional(),
})

// Profile validators
export const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  bio: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  cidade: z.string().optional(),
  photo: z.string().url().optional(),
})

// Landing page validators
export const landingBlocoSchema = z.object({
  tipo: z.enum(['hero', 'historia', 'galeria', 'carrossel', 'cta', 'imoveis', 'video', 'contato', 'texto']),
  titulo: z.string().optional(),
  subtitulo: z.string().optional(),
  texto: z.string().optional(),
  imagens: z.array(z.string().url()).optional(),
  videoUrl: z.string().url().optional(),
  ordem: z.number().int(),
  ativo: z.boolean().optional(),
  config: z.record(z.string(), z.any()).optional(),
})

// Image upload validators
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WEBP.',
    }
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 5MB.',
    }
  }

  return { valid: true }
}

// Rate limiting
export interface RateLimitConfig {
  interval: number // milliseconds
  maxRequests: number
}

export const RATE_LIMITS = {
  login: { interval: 60 * 1000, maxRequests: 5 }, // 5 requests per minute
  register: { interval: 60 * 1000, maxRequests: 3 }, // 3 requests per minute
  lead: { interval: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
  upload: { interval: 60 * 1000, maxRequests: 20 }, // 20 requests per minute
}
