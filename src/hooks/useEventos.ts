import { useState, useCallback } from 'react'

export interface Evento {
  id: string
  dataHora: string
  observacao?: string | null
  createdAt: string
  updatedAt: string
  lead: {
    id: string
    name: string
    phone: string
    email?: string | null
    corretor?: {
      id: string
      user: {
        name: string
      }
    }
  }
  imovel: {
    id: string
    titulo: string
    endereco?: string
    cidade?: string
    estado?: string
    valor?: number
  }
}

interface CreateEventoData {
  leadId: string
  imovelId: string
  dataHora: string
  observacao?: string
}

interface UpdateEventoData {
  leadId?: string
  imovelId?: string
  dataHora?: string
  observacao?: string | null
}

interface FetchEventosParams {
  leadId?: string
  imovelId?: string
  dataInicio?: string
  dataFim?: string
  limit?: number
  cursor?: string
}

interface EventosResponse {
  success: boolean
  eventos: Evento[]
  pagination: {
    nextCursor: string | null
    hasNextPage: boolean
    limit: number
  }
}

export function useEventos() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEventos = useCallback(async (params?: FetchEventosParams): Promise<EventosResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      if (params?.leadId) searchParams.append('leadId', params.leadId)
      if (params?.imovelId) searchParams.append('imovelId', params.imovelId)
      if (params?.dataInicio) searchParams.append('dataInicio', params.dataInicio)
      if (params?.dataFim) searchParams.append('dataFim', params.dataFim)
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.cursor) searchParams.append('cursor', params.cursor)

      const response = await fetch(`/api/eventos?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao buscar eventos')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar eventos'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const createEvento = useCallback(async (data: CreateEventoData): Promise<Evento | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/eventos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao criar evento')
      }

      const result = await response.json()
      return result.evento
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar evento'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateEvento = useCallback(async (id: string, data: UpdateEventoData): Promise<Evento | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/eventos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao atualizar evento')
      }

      const result = await response.json()
      return result.evento
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar evento'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteEvento = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/eventos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao excluir evento')
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir evento'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    fetchEventos,
    createEvento,
    updateEvento,
    deleteEvento,
  }
}
