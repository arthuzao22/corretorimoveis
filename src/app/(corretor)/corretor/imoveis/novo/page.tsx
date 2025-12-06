'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createImovel } from '@/server/actions/imoveis'

export default function NovoImovelPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'VENDA' as 'VENDA' | 'ALUGUEL',
    valor: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await createImovel({
        ...formData,
        valor: parseFloat(formData.valor),
        fotos: []
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
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Novo Imóvel</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
            disabled={loading}
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
            />
          </div>

          <Input
            label="Endereço"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            required
            disabled={loading}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Cidade"
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              required
              disabled={loading}
            />

            <Input
              label="Estado (UF)"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
              maxLength={2}
              required
              disabled={loading}
            />

            <Input
              label="CEP"
              value={formData.cep}
              onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Imóvel'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
