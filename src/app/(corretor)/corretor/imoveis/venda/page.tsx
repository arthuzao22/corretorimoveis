'use client'

import { useEffect, useState } from 'react'
import { Plus, Home, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PropertyList } from '@/components/imoveis/PropertyList'
import { getMyImoveis, deleteImovel } from '@/server/actions/imoveis'
import { ImovelTipo } from '@prisma/client'

export default function ImoveisVendaPage() {
  const [imoveis, setImoveis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    vendidos: 0,
    valorTotal: 0,
  })

  const loadImoveis = async () => {
    setLoading(true)
    try {
      const result = await getMyImoveis()
      if (result.success && result.imoveis) {
        // Filter only VENDA properties
        const vendaImoveis = result.imoveis.filter(
          (imovel: any) => imovel.tipo === ImovelTipo.VENDA
        )
        setImoveis(vendaImoveis)

        // Calculate stats
        const total = vendaImoveis.length
        const ativos = vendaImoveis.filter((i: any) => i.status === 'ATIVO').length
        const vendidos = vendaImoveis.filter((i: any) => i.status === 'VENDIDO').length
        const valorTotal = vendaImoveis
          .filter((i: any) => i.status === 'ATIVO')
          .reduce((sum: number, i: any) => sum + Number(i.valor), 0)

        setStats({ total, ativos, vendidos, valorTotal })
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
            <Home className="w-8 h-8 text-blue-600" />
            Imóveis para Venda
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas propriedades disponíveis para venda
          </p>
        </div>
        <Link href="/corretor/imoveis/novo">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
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
            <div className="bg-blue-100 p-3 rounded-lg">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ativos</p>
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
              <p className="text-sm text-gray-600 mb-1">Vendidos</p>
              <p className="text-3xl font-bold text-blue-600">{stats.vendidos}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Valor Total (Ativos)</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0,
                }).format(stats.valorTotal)}
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
        emptyMessage="Nenhum imóvel para venda cadastrado"
      />
    </div>
  )
}
