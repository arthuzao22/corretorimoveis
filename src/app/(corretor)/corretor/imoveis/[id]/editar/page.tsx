'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getImovelById, updateImovel } from '@/server/actions/imoveis'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'

export default function EditarImovelPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'VENDA' as 'VENDA' | 'ALUGUEL',
    valor: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    images: [] as string[]
  })
  const [newImageUrl, setNewImageUrl] = useState('')

  useEffect(() => {
    loadImovel()
  }, [id])

  const loadImovel = async () => {
    const result = await getImovelById(id)
    if (result.success && result.imovel) {
      const { imovel } = result
      setFormData({
        titulo: imovel.titulo,
        descricao: imovel.descricao,
        tipo: imovel.tipo as 'VENDA' | 'ALUGUEL',
        valor: imovel.valor.toString(),
        endereco: imovel.endereco,
        cidade: imovel.cidade,
        estado: imovel.estado,
        cep: imovel.cep || '',
        images: (imovel as any).images || []
      })
    } else {
      alert('Imóvel não encontrado')
      router.push('/corretor/imoveis')
    }
    setLoading(false)
  }

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      try {
        new URL(newImageUrl)
        setFormData({
          ...formData,
          images: [...formData.images, newImageUrl.trim()]
        })
        setNewImageUrl('')
      } catch {
        alert('URL inválida')
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const result = await updateImovel(id, {
        ...formData,
        valor: parseFloat(formData.valor)
      })

      if (result.success) {
        alert('Imóvel atualizado com sucesso!')
        router.push('/corretor/imoveis')
      } else {
        alert(result.error || 'Erro ao atualizar imóvel')
      }
    } catch (error) {
      alert('Erro ao atualizar imóvel')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/corretor/imoveis">
          <Button variant="secondary" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Imóvel</h1>
          <p className="text-gray-600 mt-1">Atualize as informações do imóvel</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações Básicas
            </h2>
            <div className="space-y-4">
              <Input
                label="Título do Imóvel"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
                placeholder="Ex: Apartamento 3 quartos no centro"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva as características do imóvel..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'VENDA' | 'ALUGUEL' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="VENDA">Venda</option>
                    <option value="ALUGUEL">Aluguel</option>
                  </select>
                </div>

                <Input
                  label="Valor (R$)"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  required
                  placeholder="Ex: 350000.00"
                />
              </div>
            </div>
          </div>

          {/* Localização */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Localização</h2>
            <div className="space-y-4">
              <Input
                label="Endereço"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                required
                placeholder="Ex: Rua das Flores, 123"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  required
                  placeholder="Ex: São Paulo"
                />

                <Input
                  label="Estado (UF)"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                  required
                  maxLength={2}
                  placeholder="Ex: SP"
                />

                <Input
                  label="CEP"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  placeholder="Ex: 12345-678"
                />
              </div>
            </div>
          </div>

          {/* Imagens */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Imagens</h2>
            <div className="space-y-4">
              {/* Lista de Imagens */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Imagem ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar Nova Imagem */}
              <div className="flex gap-2">
                <Input
                  label="URL da Imagem"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddImage()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddImage}
                  variant="secondary"
                  className="mt-6"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              <p className="text-sm text-gray-500">
                Cole a URL da imagem e clique em adicionar. Mínimo de 1 imagem.
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={submitting || formData.images.length === 0}
              className="flex-1"
            >
              {submitting ? 'Salvando...' : 'Atualizar Imóvel'}
            </Button>
            <Link href="/corretor/imoveis" className="flex-1">
              <Button type="button" variant="secondary" className="w-full">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
