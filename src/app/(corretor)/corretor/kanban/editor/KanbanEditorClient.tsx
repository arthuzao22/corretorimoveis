'use client'

import React, { useState } from 'react'
import { Plus, Edit2, Trash2, GripVertical, Star, CheckCircle2, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createColumn, updateColumn, deleteColumn, reorderColumns } from '@/server/actions/kanban'

interface Column {
  id: string
  name: string
  order: number
  color: string | null
  isInitial: boolean
  isFinal: boolean
  leadCount?: number
}

interface Board {
  id: string
  name: string
  columns: Column[]
}

interface Props {
  initialBoard: Board
}

export function KanbanEditorClient({ initialBoard }: Props) {
  const [board, setBoard] = useState(initialBoard)
  const [editingColumn, setEditingColumn] = useState<Column | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    color: '#6366f1',
    isInitial: false,
    isFinal: false,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [draggedColumn, setDraggedColumn] = useState<Column | null>(null)

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showMessage('error', 'Nome da coluna é obrigatório')
      return
    }

    setLoading(true)
    try {
      const result = await createColumn({
        boardId: board.id,
        name: formData.name,
        order: board.columns.length,
        color: formData.color,
        isInitial: formData.isInitial,
        isFinal: formData.isFinal,
      })

      if (result.success && result.column) {
        setBoard({
          ...board,
          columns: [...board.columns, { ...result.column, leadCount: 0 }]
        })
        setFormData({ name: '', color: '#6366f1', isInitial: false, isFinal: false })
        setIsCreating(false)
        showMessage('success', 'Coluna criada com sucesso!')
      } else {
        showMessage('error', result.error || 'Erro ao criar coluna')
      }
    } catch (error) {
      showMessage('error', 'Erro ao criar coluna')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingColumn || !formData.name.trim()) {
      showMessage('error', 'Nome da coluna é obrigatório')
      return
    }

    setLoading(true)
    try {
      const result = await updateColumn({
        columnId: editingColumn.id,
        name: formData.name,
        color: formData.color,
        isInitial: formData.isInitial,
        isFinal: formData.isFinal,
      })

      if (result.success && result.column) {
        setBoard({
          ...board,
          columns: board.columns.map(col =>
            col.id === editingColumn.id ? { ...col, ...result.column } : col
          )
        })
        setEditingColumn(null)
        setFormData({ name: '', color: '#6366f1', isInitial: false, isFinal: false })
        showMessage('success', 'Coluna atualizada com sucesso!')
      } else {
        showMessage('error', result.error || 'Erro ao atualizar coluna')
      }
    } catch (error) {
      showMessage('error', 'Erro ao atualizar coluna')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (column: Column) => {
    if (column.leadCount && column.leadCount > 0) {
      showMessage('error', `Esta coluna contém ${column.leadCount} leads. Mova-os antes de deletar.`)
      return
    }

    if (!confirm(`Tem certeza que deseja excluir a coluna "${column.name}"?`)) {
      return
    }

    setLoading(true)
    try {
      const result = await deleteColumn(column.id)

      if (result.success) {
        setBoard({
          ...board,
          columns: board.columns.filter(col => col.id !== column.id)
        })
        showMessage('success', 'Coluna excluída com sucesso!')
      } else {
        showMessage('error', result.error || 'Erro ao excluir coluna')
      }
    } catch (error) {
      showMessage('error', 'Erro ao excluir coluna')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (column: Column) => {
    setEditingColumn(column)
    setFormData({
      name: column.name,
      color: column.color || '#6366f1',
      isInitial: column.isInitial,
      isFinal: column.isFinal,
    })
    setIsCreating(false)
  }

  const handleCancelEdit = () => {
    setEditingColumn(null)
    setIsCreating(false)
    setFormData({ name: '', color: '#6366f1', isInitial: false, isFinal: false })
  }

  const handleDragStart = (column: Column) => {
    setDraggedColumn(column)
  }

  const handleDragOver = (e: React.DragEvent, targetColumn: Column) => {
    e.preventDefault()
    if (!draggedColumn || draggedColumn.id === targetColumn.id) return

    const newColumns = [...board.columns]
    const draggedIndex = newColumns.findIndex(col => col.id === draggedColumn.id)
    const targetIndex = newColumns.findIndex(col => col.id === targetColumn.id)

    // Reorder in memory
    newColumns.splice(draggedIndex, 1)
    newColumns.splice(targetIndex, 0, draggedColumn)

    // Update order values
    const updatedColumns = newColumns.map((col, index) => ({ ...col, order: index }))

    setBoard({
      ...board,
      columns: updatedColumns
    })
  }

  const handleDragEnd = async () => {
    if (!draggedColumn) return

    // Save the current state before attempting the update
    const previousColumns = [...board.columns]
    
    setLoading(true)
    try {
      const columnOrders = board.columns.map(col => ({ id: col.id, order: col.order }))
      const result = await reorderColumns(board.id, columnOrders)

      if (result.success) {
        showMessage('success', 'Ordem das colunas atualizada!')
      } else {
        showMessage('error', result.error || 'Erro ao reordenar colunas')
        // Revert to previous order on error
        setBoard({
          ...board,
          columns: previousColumns
        })
      }
    } catch (error) {
      showMessage('error', 'Erro ao reordenar colunas')
      // Revert to previous order on error
      setBoard({
        ...board,
        columns: previousColumns
      })
    } finally {
      setDraggedColumn(null)
      setLoading(false)
    }
  }

  const colorOptions = [
    { value: '#6366f1', label: 'Azul' },
    { value: '#10b981', label: 'Verde' },
    { value: '#f59e0b', label: 'Amarelo' },
    { value: '#ef4444', label: 'Vermelho' },
    { value: '#8b5cf6', label: 'Roxo' },
    { value: '#ec4899', label: 'Rosa' },
    { value: '#06b6d4', label: 'Ciano' },
    { value: '#6b7280', label: 'Cinza' },
  ]

  return (
    <div className="space-y-6">
      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingColumn) && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-indigo-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {editingColumn ? 'Editar Coluna' : 'Nova Coluna'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Coluna *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Novo, Em Negociação, Fechado"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor
              </label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-12 h-12 rounded-lg border-2 ${
                      formData.color === color.value ? 'border-gray-900 ring-2 ring-offset-2 ring-indigo-500' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isInitial}
                  onChange={(e) => setFormData({ ...formData, isInitial: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  disabled={loading}
                />
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Coluna Inicial (novos leads)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFinal}
                  onChange={(e) => setFormData({ ...formData, isFinal: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  disabled={loading}
                />
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Coluna Final (ganho/perdido)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={editingColumn ? handleUpdate : handleCreate}
                disabled={loading || !formData.name.trim()}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingColumn ? 'Salvar' : 'Criar'}
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="secondary"
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Column Button */}
      {!isCreating && !editingColumn && (
        <Button
          onClick={() => {
            setIsCreating(true)
            setFormData({ name: '', color: '#6366f1', isInitial: false, isFinal: false })
          }}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <Plus className="w-4 h-4" />
          Adicionar Coluna
        </Button>
      )}

      {/* Columns List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Colunas do Kanban ({board.columns.length})
        </h3>
        
        {board.columns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma coluna criada ainda. Adicione sua primeira coluna!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {board.columns.map((column) => (
              <div
                key={column.id}
                draggable={!loading}
                onDragStart={() => handleDragStart(column)}
                onDragOver={(e) => handleDragOver(e, column)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 transition-all ${
                  draggedColumn?.id === column.id ? 'opacity-50 border-indigo-400' : 'border-gray-200'
                } hover:border-gray-300 cursor-move`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: column.color || '#6b7280' }}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{column.name}</span>
                      {column.isInitial && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3" />
                          Inicial
                        </span>
                      )}
                      {column.isFinal && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Final
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Ordem: {column.order + 1} • {column.leadCount || 0} lead(s)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleEditClick(column)}
                    variant="secondary"
                    disabled={loading}
                    className="flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(column)}
                    variant="danger"
                    disabled={loading || (column.leadCount && column.leadCount > 0)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Arraste as colunas para reordená-las</li>
          <li>• Marque uma coluna como "Inicial" para que novos leads sejam atribuídos automaticamente a ela</li>
          <li>• Colunas finais são usadas para leads ganhos ou perdidos</li>
          <li>• Você só pode excluir colunas vazias (sem leads)</li>
        </ul>
      </div>
    </div>
  )
}
