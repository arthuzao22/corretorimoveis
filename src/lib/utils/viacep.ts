/**
 * Utilitário para buscar endereço via CEP usando API ViaCEP
 */

interface ViaCepResponse {
    cep: string
    logradouro: string
    complemento: string
    bairro: string
    localidade: string
    uf: string
    erro?: boolean
}

export interface AddressData {
    logradouro: string
    bairro: string
    cidade: string
    estado: string
}

/**
 * Busca endereço pelo CEP usando a API ViaCEP
 * @param cep - CEP com ou sem formatação
 * @returns Dados do endereço ou null se não encontrado
 */
export async function fetchAddressByCep(cep: string): Promise<AddressData | null> {
    const cleanCep = cep.replace(/\D/g, '')

    if (cleanCep.length !== 8) {
        return null
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data: ViaCepResponse = await response.json()

        if (data.erro) {
            return null
        }

        return {
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || ''
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error)
        return null
    }
}

/**
 * Formata CEP para exibição (00000-000)
 */
export function formatCep(cep: string): string {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length <= 5) return cleanCep
    return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5, 8)}`
}

/**
 * Valida se o CEP tem formato correto
 */
export function isValidCep(cep: string): boolean {
    const cleanCep = cep.replace(/\D/g, '')
    return cleanCep.length === 8
}
