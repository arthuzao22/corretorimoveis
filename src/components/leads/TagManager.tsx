'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { TagBadge } from '@/components/ui/TagBadge'
import { getTags, createTag, addTagToLead, removeTagFromLead } from '@/server/actions/tags'

interface Tag {
  id: string
  name: string
  color: string
}

interface LeadTag {
  id: string
  tag: Tag
}

interface TagManagerProps {
  leadId: string
  currentTags: LeadTag[]
  onTagsChange?: () => void
}

export function TagManager({ leadId, currentTags, onTagsChange }: TagManagerProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3b82f6')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    const result = await getTags()
    if (result.success && result.data) {
      setAvailableTags(result.data)
    }
  }

  const handleAddTag = async (tagId: string) => {
    setLoading(true)
    setError(null)
    
    const result = await addTagToLead({ leadId, tagId })
    
    if (result.success) {
      setShowAddMenu(false)
      onTagsChange?.()
    } else {
      setError(result.error || 'Erro ao adicionar tag')
    }
    
    setLoading(false)
  }

  const handleRemoveTag = async (tagId: string) => {
    setLoading(true)
    setError(null)
    
    const result = await removeTagFromLead({ leadId, tagId })
    
    if (result.success) {
      onTagsChange?.()
    } else {
      setError(result.error || 'Erro ao remover tag')
    }
    
    setLoading(false)
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTagName.trim()) {
      setError('Nome da tag é obrigatório')
      return
    }

    setLoading(true)
    setError(null)

    const result = await createTag({
      name: newTagName.trim(),
      color: newTagColor,
    })

    if (result.success && result.data) {
      setAvailableTags([...availableTags, result.data])
      setNewTagName('')
      setNewTagColor('#3b82f6')
      setShowCreateForm(false)
      
      // Automatically add the new tag to the lead
      await handleAddTag(result.data.id)
    } else {
      setError(result.error || 'Erro ao criar tag')
    }

    setLoading(false)
  }

  const currentTagIds = currentTags.map(lt => lt.tag.id)
  const unassignedTags = availableTags.filter(tag => !currentTagIds.includes(tag.id))

  const colorPresets = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Tags</h3>
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          disabled={loading}
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </div>
      )}

      {/* Current Tags */}
      <div className="flex flex-wrap gap-2">
        {currentTags.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma tag adicionada</p>
        ) : (
          currentTags.map((lt) => (
            <TagBadge
              key={lt.id}
              name={lt.tag.name}
              color={lt.tag.color}
              size="md"
              onRemove={() => handleRemoveTag(lt.tag.id)}
            />
          ))
        )}
      </div>

      {/* Add Tag Menu */}
      {showAddMenu && (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
          {unassignedTags.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">Selecione uma tag:</p>
              <div className="flex flex-wrap gap-2">
                {unassignedTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag.id)}
                    disabled={loading}
                    className="hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    <TagBadge name={tag.name} color={tag.color} size="md" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Todas as tags foram adicionadas</p>
          )}

          {/* Create New Tag Form */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Criar nova tag
            </button>
          ) : (
            <form onSubmit={handleCreateTag} className="space-y-2 pt-2 border-t border-gray-300">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Nome da Tag
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Ex: Cliente VIP"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={50}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Cor
                </label>
                <div className="flex gap-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewTagColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newTagColor === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      disabled={loading}
                    />
                  ))}
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading || !newTagName.trim()}
                  className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Criar e Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewTagName('')
                    setNewTagColor('#3b82f6')
                    setError(null)
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700"
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
