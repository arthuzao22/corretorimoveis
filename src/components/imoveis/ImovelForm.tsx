'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, Plus, Image as ImageIcon } from 'lucide-react'
import { z } from 'zod'

// =============================================
// VALIDAÇÃO ZOD COMPLETA
// =============================================
const imovelFormSchema = z.object({
  titulo: z.string().min(5, 'Título deve ter no mínimo 5 caracteres'),
  descricao: z.string().min(20, 'Descrição deve ter no mínimo 20 caracteres'),
  tipo: z.enum(['VENDA', 'ALUGUEL']),
  statusConfigId: z.string().optional().nullable(),
  valor: z.string().min(1, 'Valor é obrigatório'),
  endereco: z.string().min(5, 'Endereço é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  cidadeId: z.string().optional().nullable(),
  estado: z.string().length(2, 'Estado deve ter 2 letras (UF)'),
  cep: z.string().optional(),
  bairro: z.string().optional(),
  quartos: z.string().optional(),
  banheiros: z.string().optional(),
  suites: z.string().optional(),
  area: z.string().optional(),
  areaTerreno: z.string().optional(),
  garagem: z.string().optional(),
  condominio: z.string().optional(),
  iptu: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  destaque: z.boolean(),
  images: z.array(z.string().url()).min(1, 'Adicione pelo menos uma imagem'),
})

type ImovelFormData = z.infer<typeof imovelFormSchema>

interface ImovelFormProps {
  imovel?: any
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>
  submitLabel?: string
}

export function ImovelForm({ imovel, onSubmit, submitLabel = 'Salvar Imóvel' }: ImovelFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [cidades, setCidades] = useState<any[]>([])
  const [statusConfigs, setStatusConfigs] = useState<any[]>([])

  const [formData, setFormData] = useState<ImovelFormData>({
    titulo: imovel?.titulo || '',
    descricao: imovel?.descricao || '',
    tipo: imovel?.tipo || 'VENDA',
    statusConfigId: imovel?.statusConfigId || null,
    valor: imovel?.valor?.toString() || '',
    endereco: imovel?.endereco || '',
    cidade: imovel?.cidade || '',
    cidadeId: imovel?.cidadeId || null,
    estado: imovel?.estado || '',
    cep: imovel?.cep || '',
    bairro: imovel?.bairro || '',
    quartos: imovel?.quartos?.toString() || '',
    banheiros: imovel?.banheiros?.toString() || '',
    suites: imovel?.suites?.toString() || '',
    area: imovel?.area?.toString() || '',
    areaTerreno: imovel?.areaTerreno?.toString() || '',
    garagem: imovel?.garagem?.toString() || '',
    condominio: imovel?.condominio?.toString() || '',
    iptu: imovel?.iptu?.toString() || '',
    latitude: imovel?.latitude?.toString() || '',
    longitude: imovel?.longitude?.toString() || '',
    destaque: imovel?.destaque || false,
    images: imovel?.images || [],
  })

  // Carregar cidades e status configs
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cidadesRes, statusRes] = await Promise.all([
          fetch('/api/cidades'),
          fetch('/api/imovel-status'),
        ])

        if (cidadesRes.ok) {
          const cidadesData = await cidadesRes.json()
          setCidades(cidadesData.cidades || [])
        }

        if (statusRes.ok) {
          const statusData = await statusRes.json()
          setStatusConfigs(statusData.status || [])
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      }
    }

    loadData()
  }, [])

  const addImage = () => {
    if (imageUrl.trim() && imageUrl.startsWith('http')) {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl.trim()],
      })
      setImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // Validação com Zod
      const validatedData = imovelFormSchema.parse(formData)

      setLoading(true)

      // Converter strings para números quando necessário
      const submitData = {
        titulo: validatedData.titulo,
        descricao: validatedData.descricao,
        tipo: validatedData.tipo,
        statusConfigId: validatedData.statusConfigId || undefined,
        valor: parseFloat(validatedData.valor),
        endereco: validatedData.endereco,
        cidade: validatedData.cidade,
        cidadeId: validatedData.cidadeId || undefined,
        estado: validatedData.estado.toUpperCase(),
        cep: validatedData.cep || undefined,
        bairro: validatedData.bairro || undefined,
        quartos: validatedData.quartos ? parseInt(validatedData.quartos) : undefined,
        banheiros: validatedData.banheiros ? parseInt(validatedData.banheiros) : undefined,
        suites: validatedData.suites ? parseInt(validatedData.suites) : undefined,
        area: validatedData.area ? parseFloat(validatedData.area) : undefined,
        areaTerreno: validatedData.areaTerreno ? parseFloat(validatedData.areaTerreno) : undefined,
        garagem: validatedData.garagem ? parseInt(validatedData.garagem) : undefined,
        condominio: validatedData.condominio ? parseFloat(validatedData.condominio) : undefined,
        iptu: validatedData.iptu ? parseFloat(validatedData.iptu) : undefined,
        latitude: validatedData.latitude ? parseFloat(validatedData.latitude) : undefined,
        longitude: validatedData.longitude ? parseFloat(validatedData.longitude) : undefined,
        destaque: validatedData.destaque,
        images: validatedData.images,
      }

      const result = await onSubmit(submitData)

      if (result.success) {
        router.push('/corretor/imoveis')
        router.refresh()
      } else {
        setError(result.error || 'Erro ao salvar imóvel')
        setLoading(false)
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message)
      } else {
        setError('Erro ao validar formulário')
      }
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">
            📋 Informações Básicas
          </h3>

          <Input
            label="Título *"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
            disabled={loading}
            placeholder="Ex: Apartamento 3 quartos no centro"
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Descrição *</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              rows={5}
              required
              disabled={loading}
              placeholder="Descreva as características, diferenciais e detalhes do imóvel..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Tipo *</label>
              <select
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({ ...formData, tipo: e.target.value as 'VENDA' | 'ALUGUEL' })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={loading}
                required
              >
                <option value="VENDA">Venda</option>
                <option value="ALUGUEL">Aluguel</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.statusConfigId || ''}
                onChange={(e) =>
                  setFormData({ ...formData, statusConfigId: e.target.value || null })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={loading}
              >
                <option value="">Selecione um status</option>
                {statusConfigs.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-7">
              <input
                type="checkbox"
                id="destaque"
                checked={formData.destaque}
                onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="destaque" className="text-sm font-medium text-gray-700">
                ⭐ Imóvel em Destaque
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* SEÇÃO 2: VALORES */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">💰 Valores</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Valor (R$) *"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              required
              disabled={loading}
              placeholder="0,00"
            />

            <Input
              label="Condomínio (R$)"
              type="number"
              step="0.01"
              value={formData.condominio}
              onChange={(e) => setFormData({ ...formData, condominio: e.target.value })}
              disabled={loading}
              placeholder="0,00"
            />

            <Input
              label="IPTU (R$)"
              type="number"
              step="0.01"
              value={formData.iptu}
              onChange={(e) => setFormData({ ...formData, iptu: e.target.value })}
              disabled={loading}
              placeholder="0,00"
            />
          </div>
        </div>
      </Card>

      {/* SEÇÃO 3: LOCALIZAÇÃO */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">📍 Localização</h3>

          <Input
            label="Endereço Completo *"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            required
            disabled={loading}
            placeholder="Rua, número, complemento"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Bairro"
              value={formData.bairro}
              onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
              disabled={loading}
              placeholder="Centro"
            />

            <Input
              label="CEP"
              value={formData.cep}
              onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
              disabled={loading}
              placeholder="00000-000"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Cidade (Normalizada)</label>
              <select
                value={formData.cidadeId || ''}
                onChange={(e) => {
                  const selectedCidade = cidades.find((c) => c.id === e.target.value)
                  setFormData({
                    ...formData,
                    cidadeId: e.target.value || null,
                    cidade: selectedCidade ? selectedCidade.nome : formData.cidade,
                    estado: selectedCidade ? selectedCidade.uf : formData.estado,
                  })
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={loading}
              >
                <option value="">Selecione uma cidade</option>
                {cidades.map((cidade) => (
                  <option key={cidade.id} value={cidade.id}>
                    {cidade.nome} - {cidade.uf}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Cidade (Texto) *"
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              required
              disabled={loading}
              placeholder="São Paulo"
            />

            <Input
              label="Estado (UF) *"
              value={formData.estado}
              onChange={(e) =>
                setFormData({ ...formData, estado: e.target.value.toUpperCase() })
              }
              maxLength={2}
              required
              disabled={loading}
              placeholder="SP"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Latitude (para mapas)"
              type="number"
              step="0.00000001"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              disabled={loading}
              placeholder="-23.5505199"
            />

            <Input
              label="Longitude (para mapas)"
              type="number"
              step="0.00000001"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              disabled={loading}
              placeholder="-46.6333094"
            />
          </div>
        </div>
      </Card>

      {/* SEÇÃO 4: CARACTERÍSTICAS */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">
            🏠 Características do Imóvel
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Input
              label="Quartos"
              type="number"
              min="0"
              value={formData.quartos}
              onChange={(e) => setFormData({ ...formData, quartos: e.target.value })}
              disabled={loading}
              placeholder="0"
            />

            <Input
              label="Banheiros"
              type="number"
              min="0"
              value={formData.banheiros}
              onChange={(e) => setFormData({ ...formData, banheiros: e.target.value })}
              disabled={loading}
              placeholder="0"
            />

            <Input
              label="Suítes"
              type="number"
              min="0"
              value={formData.suites}
              onChange={(e) => setFormData({ ...formData, suites: e.target.value })}
              disabled={loading}
              placeholder="0"
            />

            <Input
              label="Garagem"
              type="number"
              min="0"
              value={formData.garagem}
              onChange={(e) => setFormData({ ...formData, garagem: e.target.value })}
              disabled={loading}
              placeholder="0"
            />

            <Input
              label="Área (m²)"
              type="number"
              step="0.01"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              disabled={loading}
              placeholder="0,00"
            />

            <Input
              label="Área Terreno (m²)"
              type="number"
              step="0.01"
              value={formData.areaTerreno}
              onChange={(e) => setFormData({ ...formData, areaTerreno: e.target.value })}
              disabled={loading}
              placeholder="0,00"
            />
          </div>
        </div>
      </Card>

      {/* SEÇÃO 5: FOTOS */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">📸 Fotos do Imóvel</h3>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                label=""
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={loading}
                placeholder="Cole a URL da imagem (https://...)"
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
              <p className="text-gray-500 font-medium">Nenhuma imagem adicionada</p>
              <p className="text-sm text-gray-400 mt-1">Adicione pelo menos uma imagem *</p>
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
                    <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                      Capa
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* ERROS E AÇÕES */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200">
          ⚠️ {error}
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
          {loading ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
