'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X } from 'lucide-react'

interface BlocoFormProps {
  tipo: string
  onSubmit: (data: any) => void
  onCancel: () => void
  initialData?: any
}

export function BlocoForm({ tipo, onSubmit, onCancel, initialData }: BlocoFormProps) {
  const [formData, setFormData] = useState(initialData || {
    titulo: '',
    subtitulo: '',
    texto: '',
    imagens: [] as string[],
    videoUrl: '',
    config: {}
  })
  const [novaImagem, setNovaImagem] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addImagem = () => {
    if (novaImagem.trim()) {
      setFormData({
        ...formData,
        imagens: [...formData.imagens, novaImagem.trim()]
      })
      setNovaImagem('')
    }
  }

  const removeImagem = (index: number) => {
    setFormData({
      ...formData,
      imagens: formData.imagens.filter((_: string, i: number) => i !== index)
    })
  }

  const getTipoLabel = () => {
    const labels: Record<string, string> = {
      hero: 'Hero Banner',
      historia: 'História da Empresa',
      galeria: 'Galeria de Fotos',
      carrossel: 'Carrossel',
      cta: 'Chamada para Ação',
      imoveis: 'Imóveis em Destaque',
      video: 'Vídeo',
      contato: 'Contato',
      texto: 'Bloco de Texto'
    }
    return labels[tipo] || tipo
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {initialData ? 'Editar' : 'Criar'} Bloco: {getTipoLabel()}
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título
          </label>
          <Input
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Digite o título do bloco"
          />
        </div>

        {tipo !== 'texto' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtítulo
            </label>
            <Input
              value={formData.subtitulo}
              onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
              placeholder="Digite o subtítulo"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texto / Descrição
          </label>
          <textarea
            value={formData.texto}
            onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
            placeholder="Digite o texto do bloco"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {(tipo === 'hero' || tipo === 'galeria' || tipo === 'carrossel' || tipo === 'historia') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagens (URLs)
            </label>
            <div className="space-y-2">
              {formData.imagens.map((img: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input value={img} readOnly className="flex-1" />
                  <Button
                    type="button"
                    onClick={() => removeImagem(index)}
                    variant="outline"
                    className="px-3"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={novaImagem}
                  onChange={(e) => setNovaImagem(e.target.value)}
                  placeholder="URL da imagem"
                  className="flex-1"
                />
                <Button type="button" onClick={addImagem}>
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        )}

        {tipo === 'video' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Vídeo (YouTube)
            </label>
            <Input
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            {initialData ? 'Salvar Alterações' : 'Criar Bloco'}
          </Button>
          <Button type="button" onClick={onCancel} variant="outline">
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}
