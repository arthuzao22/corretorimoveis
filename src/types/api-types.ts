/**
 * Tipos padronizados para respostas de API
 * Garante consistência em todos os endpoints
 */

/**
 * Resposta padrão de API
 */
export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
    details?: unknown
}

/**
 * Resposta paginada
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        nextCursor: string | null
        hasNextPage: boolean
        limit: number
        total?: number
    }
}

/**
 * Tipos específicos para configurações
 */
export interface CidadeData {
    id: string
    nome: string
    uf: string
    slug: string
}

export interface StatusConfigData {
    id: string
    nome: string
    slug: string
    cor: string | null
    ordem: number
}

/**
 * Tipo para resposta de leads
 */
export interface LeadData {
    id: string
    name: string
    email: string | null
    phone: string
    message: string | null
    description: string | null
    priority: string
    origem: string | null
    status: string
    anotacoes: string | null
    dataContato: Date | null
    dataAgendamento: Date | null
    createdAt: Date
    updatedAt: Date
}

/**
 * Tipo para resposta de imóveis
 */
export interface ImovelData {
    id: string
    titulo: string
    tipo: 'VENDA' | 'ALUGUEL'
    valor: number
    endereco: string
    cidade: string
    estado: string
    quartos: number | null
    banheiros: number | null
    area: number | null
    images: string[]
    destaque: boolean
    createdAt: Date
}
