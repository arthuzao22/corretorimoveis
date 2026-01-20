'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Home, Users, Calendar, Plus, X, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getMyImoveis } from '@/server/actions/imoveis'
import { getMyLeads } from '@/server/actions/leads'

interface SearchResult {
  id: string
  type: 'imovel' | 'lead' | 'action'
  title: string
  subtitle?: string
  url?: string
  action?: () => void
  icon: any
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  // Save recent search
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // Quick actions (always shown)
  const quickActions: SearchResult[] = [
    {
      id: 'new-imovel',
      type: 'action',
      title: 'Novo Imóvel',
      subtitle: 'Cadastrar um novo imóvel',
      icon: Home,
      action: () => {
        router.push('/corretor/imoveis/novo')
        onClose()
      }
    },
    {
      id: 'kanban',
      type: 'action',
      title: 'Abrir Kanban',
      subtitle: 'Visualizar pipeline de leads',
      icon: Users,
      action: () => {
        router.push('/corretor/kanban')
        onClose()
      }
    },
    {
      id: 'calendario',
      type: 'action',
      title: 'Abrir Calendário',
      subtitle: 'Ver eventos e visitas agendadas',
      icon: Calendar,
      action: () => {
        router.push('/corretor/calendario')
        onClose()
      }
    }
  ]

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(quickActions)
      return
    }

    setLoading(true)
    try {
      const [imoveisResult, leadsResult] = await Promise.all([
        getMyImoveis(),
        getMyLeads()
      ])

      const searchResults: SearchResult[] = []
      const queryLower = searchQuery.toLowerCase()

      // Search properties
      if (imoveisResult.success && imoveisResult.imoveis) {
        const matchingImoveis = imoveisResult.imoveis.filter((imovel: any) =>
          imovel.titulo.toLowerCase().includes(queryLower) ||
          imovel.endereco?.toLowerCase().includes(queryLower) ||
          imovel.bairro?.toLowerCase().includes(queryLower) ||
          imovel.cidade.toLowerCase().includes(queryLower)
        ).slice(0, 5)

        matchingImoveis.forEach((imovel: any) => {
          searchResults.push({
            id: imovel.id,
            type: 'imovel',
            title: imovel.titulo,
            subtitle: `${imovel.cidade}, ${imovel.estado} - R$ ${Number(imovel.valor).toLocaleString('pt-BR')}`,
            url: `/corretor/imoveis/${imovel.id}/editar`,
            icon: Home
          })
        })
      }

      // Search leads
      if (leadsResult.success && leadsResult.leads) {
        const matchingLeads = leadsResult.leads.filter((lead: any) =>
          lead.name.toLowerCase().includes(queryLower) ||
          lead.email?.toLowerCase().includes(queryLower) ||
          lead.phone?.includes(searchQuery)
        ).slice(0, 5)

        matchingLeads.forEach((lead: any) => {
          searchResults.push({
            id: lead.id,
            type: 'lead',
            title: lead.name,
            subtitle: `${lead.phone}${lead.email ? ` • ${lead.email}` : ''}`,
            url: `/corretor/leads?leadId=${lead.id}`,
            icon: Users
          })
        })
      }

      // Add quick actions at the end if there are results
      if (searchResults.length > 0) {
        setResults([...searchResults, ...quickActions])
      } else {
        setResults(quickActions)
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults(quickActions)
    } finally {
      setLoading(false)
    }
  }, [router, onClose])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, performSearch])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = results[selectedIndex]
        if (selected) {
          saveRecentSearch(query)
          if (selected.action) {
            selected.action()
          } else if (selected.url) {
            router.push(selected.url)
            onClose()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose, router, query])

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setResults(quickActions)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar imóveis, leads, ou digite um comando..."
            className="flex-1 text-lg outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded">
            ESC
          </kbd>
        </div>

        {/* Recent Searches */}
        {!query && recentSearches.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Clock className="w-3 h-3" />
              Buscas recentes
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(search)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum resultado encontrado
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, idx) => {
                const Icon = result.icon
                return (
                  <button
                    key={result.id}
                    onClick={() => {
                      saveRecentSearch(query)
                      if (result.action) {
                        result.action()
                      } else if (result.url) {
                        router.push(result.url)
                        onClose()
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                      idx === selectedIndex ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      result.type === 'imovel' ? 'bg-blue-100 text-blue-600' :
                      result.type === 'lead' ? 'bg-purple-100 text-purple-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-sm text-gray-500">{result.subtitle}</p>
                      )}
                    </div>
                    {result.type === 'action' && (
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded">
                        ↵
                      </kbd>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-white border border-gray-300 rounded">↑</kbd>
              <kbd className="px-1 bg-white border border-gray-300 rounded">↓</kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-white border border-gray-300 rounded">↵</kbd>
              selecionar
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1 bg-white border border-gray-300 rounded">ESC</kbd>
            fechar
          </span>
        </div>
      </div>
    </div>
  )
}
