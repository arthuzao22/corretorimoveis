'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Plus, Edit2, Trash2, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getMyMessageTemplates, createMessageTemplate, deleteMessageTemplate } from '@/server/actions/message-templates'

interface MessageTemplate {
  id: string
  nome: string
  mensagem: string
  categoria: string
}

interface MessageTemplateSelectorProps {
  onSelectTemplate: (message: string) => void
  leadName?: string
  imovelTitulo?: string
}

export function MessageTemplateSelector({ onSelectTemplate, leadName, imovelTitulo }: MessageTemplateSelectorProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [showTemplates, setShowTemplates] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    mensagem: '',
    categoria: 'OUTRO' as const
  })

  useEffect(() => {
    if (showTemplates) {
      loadTemplates()
    }
  }, [showTemplates])

  const loadTemplates = async () => {
    setLoading(true)
    const result = await getMyMessageTemplates()
    if (result.success && result.templates) {
      setTemplates(result.templates as any)
    }
    setLoading(false)
  }

  const handleCreateTemplate = async () => {
    if (!formData.nome || !formData.mensagem) {
      alert('Preencha todos os campos')
      return
    }

    const result = await createMessageTemplate(formData)
    if (result.success) {
      setFormData({ nome: '', mensagem: '', categoria: 'OUTRO' })
      setShowCreateForm(false)
      loadTemplates()
    } else {
      alert(result.error)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este template?')) {
      return
    }

    const result = await deleteMessageTemplate(id)
    if (result.success) {
      loadTemplates()
    } else {
      alert(result.error)
    }
  }

  const handleUseTemplate = (mensagem: string) => {
    // Replace variables
    let processedMessage = mensagem
    if (leadName) {
      processedMessage = processedMessage.replace(/\{nome\}/gi, leadName)
    }
    if (imovelTitulo) {
      processedMessage = processedMessage.replace(/\{imovel\}/gi, imovelTitulo)
    }
    
    onSelectTemplate(processedMessage)
    setShowTemplates(false)
  }

  const categoriaLabels = {
    BOAS_VINDAS: 'Boas-vindas',
    ACOMPANHAMENTO: 'Acompanhamento',
    AGENDAMENTO: 'Agendamento',
    POS_VISITA: 'Pós-visita',
    OUTRO: 'Outro'
  }

  if (!showTemplates) {
    return (
      <Button
        onClick={() => setShowTemplates(true)}
        variant="secondary"
        className="flex items-center gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        Templates
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Templates de Mensagem</h2>
                <p className="text-sm text-gray-600">Selecione ou crie um template</p>
              </div>
            </div>
            <button
              onClick={() => setShowTemplates(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Create Template Form */}
          {showCreateForm ? (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4">Novo Template</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Template
                  </label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Boas-vindas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="BOAS_VINDAS">Boas-vindas</option>
                    <option value="ACOMPANHAMENTO">Acompanhamento</option>
                    <option value="AGENDAMENTO">Agendamento</option>
                    <option value="POS_VISITA">Pós-visita</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem
                  </label>
                  <textarea
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    placeholder="Use {nome} para o nome do lead e {imovel} para o título do imóvel"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Variáveis: {'{nome}'}, {'{imovel}'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateTemplate} className="flex-1">
                    Salvar Template
                  </Button>
                  <Button onClick={() => setShowCreateForm(false)} variant="secondary">
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="secondary"
              className="w-full mb-4 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Novo Template
            </Button>
          )}

          {/* Templates List */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum template criado ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{template.nome}</h4>
                      <span className="text-xs text-gray-500">
                        {categoriaLabels[template.categoria as keyof typeof categoriaLabels]}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">
                    {template.mensagem}
                  </p>
                  <Button
                    onClick={() => handleUseTemplate(template.mensagem)}
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Usar Template
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
