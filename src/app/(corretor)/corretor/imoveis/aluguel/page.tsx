'use client'

import { useEffect, useState } from 'react'
import { Plus, KeyRound, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PropertyList } from '@/components/imoveis/PropertyList'
import { getMyImoveis, deleteImovel } from '@/server/actions/imoveis'
import { ImovelTipo } from '@prisma/client'

export default function ImoveisAluguelPage() {
  const [imoveis, setImoveis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    alugados: 0,
    valorMensal: 0,
  })

  const loadImoveis = async () => {
    setLoading(true)
    try {
      const result = await getMyImoveis()
      if (result.success && result.imoveis) {
        // Filter only ALUGUEL properties
        const aluguelImoveis = result.imoveis.filter(
          (imovel: any) => imovel.tipo === ImovelTipo.ALUGUEL
        )
        setImoveis(aluguelImoveis)

        // Calculate stats
        const total = aluguelImoveis.length
        const ativos = aluguelImoveis.filter((i: any) => i.status === 'ATIVO').length
        const alugados = aluguelImoveis.filter((i: any) => i.status === 'ALUGADO').length
        const valorMensal = aluguelImoveis
          .filter((i: any) => i.status === 'ATIVO')
          .reduce((sum: number, i: any) => sum + Number(i.valor), 0)

        setStats({ total, ativos, alugados, valorMensal })
      }
    } catch (error) {
      console.error('Error loading imoveis:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadImoveis()
  }, [])

  const handleDelete = async (id: string) => {
    const result = await deleteImovel(id)
    if (result.success) {
      loadImoveis()
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <KeyRound className="w-8 h-8 text-purple-600" />
            Imóveis para Aluguel
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas propriedades disponíveis para locação
          </p>
        </div>
        <Link href="/corretor/imoveis/novo">
          <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
            <Plus className="w-5 h-5" />
            Novo Imóvel
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Imóveis</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <KeyRound className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Disponíveis</p>
              <p className="text-3xl font-bold text-green-600">{stats.ativos}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Alugados</p>
              <p className="text-3xl font-bold text-purple-600">{stats.alugados}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Renda Potencial</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0,
                }).format(stats.valorMensal)}
                <span className="text-sm text-gray-600 font-normal">/mês</span>
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Property List */}
      <PropertyList
        imoveis={imoveis}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="Nenhum imóvel para aluguel cadastrado"
      />
    </div>
  )
}
