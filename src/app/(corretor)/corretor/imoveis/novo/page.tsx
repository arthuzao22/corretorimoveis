'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createImovel } from '@/server/actions/imoveis'
import { X, Plus, Image as ImageIcon } from 'lucide-react'

export default function NovoImovelPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')
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

  const addImage = () => {
    if (imageUrl.trim() && imageUrl.startsWith('http')) {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl.trim()]
      })
      setImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.images.length === 0) {
      setError('Adicione pelo menos uma imagem do imóvel')
      return
    }

    setLoading(true)

    try {
      const result = await createImovel({
        ...formData,
        valor: parseFloat(formData.valor),
        images: formData.images
      })

      if (result.success) {
        router.push('/corretor/imoveis')
      } else {
        setError(result.error || 'Erro ao criar imóvel')
        setLoading(false)
      }
    } catch (err) {
      setError('Erro ao criar imóvel')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Novo Imóvel</h1>
        <p className="text-gray-600 mt-1">Cadastre um novo imóvel no seu portfólio</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
            
            <Input
              label="Título"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
              disabled={loading}
              placeholder="Ex: Apartamento 3 quartos no centro"
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
                disabled={loading}
                placeholder="Descreva as características do imóvel..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'VENDA' | 'ALUGUEL' })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
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
                disabled={loading}
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Localização</h3>
            
            <Input
              label="Endereço"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              required
              disabled={loading}
              placeholder="Rua, número, bairro"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                required
                disabled={loading}
                placeholder="São Paulo"
              />

              <Input
                label="Estado (UF)"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                maxLength={2}
                required
                disabled={loading}
                placeholder="SP"
              />

              <Input
                label="CEP"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                disabled={loading}
                placeholder="00000-000"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Fotos do Imóvel</h3>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  label=""
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={loading}
                  placeholder="Cole a URL da imagem"
                />
              </div>
              <Button
                type="button"
                onClick={addImage}
                disabled={loading || !imageUrl.trim()}
                className="mt-0"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            {formData.images.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhuma imagem adicionada</p>
                <p className="text-sm text-gray-400 mt-1">Adicione pelo menos uma imagem</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-property.jpg'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={loading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Capa
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || formData.images.length === 0}>
              {loading ? 'Salvando...' : 'Salvar Imóvel'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
