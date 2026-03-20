'use client'

import { useState } from 'react'
import { X, FolderInput, Tag as TagIcon, Thermometer, Trash2, Loader2, CheckSquare } from 'lucide-react'
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

  const closeMenus = () => {
    setShowMoveMenu(false)
    setShowTempMenu(false)
  }

  return (
    <>
      {/* Backdrop to close dropdowns */}
      {(showMoveMenu || showTempMenu) && (
        <div className="fixed inset-0 z-40" onClick={closeMenus} />
      )}

      {/* Fixed bottom action bar — Gmail / WhatsApp style */}
      <div className="fixed bottom-0 inset-x-0 z-50 animate-bulk-slide-up">
        {/* Subtle top shadow */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

        <div className="bg-white border-t border-slate-200 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
          <div className="max-w-5xl mx-auto px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {/* Top: Count + Clear */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white">
                  <span className="text-xs font-bold">{selectedCount}</span>
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  {selectedCount === 1 ? 'lead selecionado' : 'leads selecionados'}
                </span>
              </div>
              <button
                onClick={onClear}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                Limpar
              </button>
            </div>

            {/* Actions row */}
            <div className="flex items-center gap-2">
              {/* Move to column */}
              <div className="relative flex-1">
                <button
                  onClick={handleShowMove}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors disabled:opacity-50 border border-indigo-100"
                >
                  <FolderInput className="w-4 h-4" />
                  <span className="text-[13px] font-semibold">Mover</span>
                </button>

                {/* Move dropdown — opens upward */}
                {showMoveMenu && (
                  <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 max-h-[240px] overflow-y-auto z-50">
                    <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Mover para</p>
                    {columns.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => handleBulkMove(col.id)}
                        disabled={loading}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 transition-colors text-slate-700 text-sm disabled:opacity-50"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: col.color || '#6b7280' }}
                        />
                        <span className="font-medium truncate">{col.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Temperature */}
              <div className="relative flex-1">
                <button
                  onClick={handleShowTemp}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition-colors disabled:opacity-50 border border-amber-100"
                >
                  <Thermometer className="w-4 h-4" />
                  <span className="text-[13px] font-semibold">Temperatura</span>
                </button>

                {/* Temp dropdown */}
                {showTempMenu && (
                  <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                    <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Definir como</p>
                    {[
                      { key: 'quente' as const, emoji: '🔥', label: 'Quente' },
                      { key: 'morno' as const, emoji: '☀️', label: 'Morno' },
                      { key: 'frio' as const, emoji: '❄️', label: 'Frio' },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => handleBulkTemperatura(t.key)}
                        disabled={loading}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 transition-colors text-slate-700 text-sm disabled:opacity-50"
                      >
                        <span className="text-base">{t.emoji}</span>
                        <span className="font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Delete */}
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors disabled:opacity-50 border border-red-100"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bulk-slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-bulk-slide-up {
          animation: bulk-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  )
}
