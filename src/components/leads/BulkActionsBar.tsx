'use client'

import { useState } from 'react'
import { X, FolderInput, Tag as TagIcon, Thermometer, Trash2, Loader2 } from 'lucide-react'
import { getKanbanColumns, bulkMoveLeads } from '@/server/actions/kanban'
import { bulkDeleteLeads, bulkUpdateTemperatura } from '@/server/actions/leads'

interface BulkActionsBarProps {
  selectedCount: number
  selectedLeadIds: string[]
  onClear: () => void
  onComplete: () => void
}

export function BulkActionsBar({ selectedCount, selectedLeadIds, onClear, onComplete }: BulkActionsBarProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const [showTempMenu, setShowTempMenu] = useState(false)
  const [columns, setColumns] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleShowMove = async () => {
    if (columns.length === 0) {
      try {
        const result = await getKanbanColumns()
        if (result.success && result.columns) {
          setColumns(result.columns)
        }
      } catch (error) {
        console.error('Error loading columns:', error)
      }
    }
    setShowMoveMenu(!showMoveMenu)
    setShowTempMenu(false)
  }

  const handleShowTemp = () => {
    setShowTempMenu(!showTempMenu)
    setShowMoveMenu(false)
  }

  const handleBulkMove = async (columnId: string) => {
    setLoading(true)
    try {
      const result = await bulkMoveLeads({ leadIds: selectedLeadIds, columnId })
      if (result.success) {
        onComplete()
      } else {
        alert(result.error || 'Erro ao mover leads')
      }
    } catch (error) {
      console.error('Error moving leads:', error)
      alert('Erro ao mover leads')
    } finally {
      setLoading(false)
      setShowMoveMenu(false)
    }
  }

  const handleBulkTemperatura = async (temperatura: 'quente' | 'morno' | 'frio') => {
    setLoading(true)
    try {
      const result = await bulkUpdateTemperatura({ leadIds: selectedLeadIds, temperatura })
      if (result.success) {
        onComplete()
      } else {
        alert(result.error || 'Erro ao atualizar temperatura')
      }
    } catch (error) {
      console.error('Error updating temperatura:', error)
      alert('Erro ao atualizar temperatura')
    } finally {
      setLoading(false)
      setShowTempMenu(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir ${selectedCount} lead(s)?`)) {
      return
    }

    setLoading(true)
    try {
      const result = await bulkDeleteLeads({ leadIds: selectedLeadIds })
      if (result.success) {
        onComplete()
      } else {
        alert(result.error || 'Erro ao excluir leads')
      }
    } catch (error) {
      console.error('Error deleting leads:', error)
      alert('Erro ao excluir leads')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-2xl px-6 py-4 flex items-center gap-4 animate-slide-up">
        {/* Selected Count */}
        <div className="flex items-center gap-2 pr-4 border-r border-white/20">
          <span className="font-semibold">{selectedCount}</span>
          <span className="text-sm">selecionado{selectedCount > 1 ? 's' : ''}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 relative">
          {/* Move Button */}
          <div className="relative">
            <button
              onClick={handleShowMove}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              title="Mover para coluna"
            >
              <FolderInput className="w-4 h-4" />
              <span className="text-sm font-medium">Mover</span>
            </button>

            {/* Move Dropdown */}
            {showMoveMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-xl py-2 min-w-[200px] max-h-[300px] overflow-y-auto">
                {columns.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => handleBulkMove(col.id)}
                    disabled={loading}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-gray-900 text-sm disabled:opacity-50"
                    style={{
                      borderLeft: `4px solid ${col.color || '#6b7280'}`,
                    }}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Temperature Button */}
          <div className="relative">
            <button
              onClick={handleShowTemp}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              title="Alterar temperatura"
            >
              <Thermometer className="w-4 h-4" />
              <span className="text-sm font-medium">Temperatura</span>
            </button>

            {/* Temperature Dropdown */}
            {showTempMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-xl py-2 min-w-[180px]">
                <button
                  onClick={() => handleBulkTemperatura('quente')}
                  disabled={loading}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-gray-900 text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <span>🔥</span>
                  <span>Quente</span>
                </button>
                <button
                  onClick={() => handleBulkTemperatura('morno')}
                  disabled={loading}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-gray-900 text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <span>🟡</span>
                  <span>Morno</span>
                </button>
                <button
                  onClick={() => handleBulkTemperatura('frio')}
                  disabled={loading}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-gray-900 text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <span>❄️</span>
                  <span>Frio</span>
                </button>
              </div>
            )}
          </div>

          {/* Delete Button */}
          <button
            onClick={handleBulkDelete}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
            title="Excluir selecionados"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Excluir</span>
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <Loader2 className="w-5 h-5 animate-spin" />
        )}

        {/* Clear Selection */}
        <button
          onClick={onClear}
          disabled={loading}
          className="ml-2 p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          title="Limpar seleção"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
