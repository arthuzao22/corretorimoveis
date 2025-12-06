'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getMyImoveis, deleteImovel } from '@/server/actions/imoveis'
import Link from 'next/link'
import { Plus, Edit2, Trash2 } from 'lucide-react'

type Imovel = {
  id: string
  titulo: string
  tipo: string
  status: string
  valor: number
  cidade: string
  estado: string
  images: string[]
  createdAt: Date
}

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [loading, setLoading] = useState(true)

  const loadImoveis = async () => {
    const result = await getMyImoveis()
    if (result.success && result.imoveis) {
      setImoveis(result.imoveis as any)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadImoveis()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este imóvel?')) {
      return
    }

    const result = await deleteImovel(id)
    if (result.success) {
      loadImoveis()
    } else {
      alert(result.error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Imóveis</h1>
          <p className="text-gray-600 mt-1">Gerencie seus imóveis cadastrados</p>
        </div>
        <Link href="/corretor/imoveis/novo">
          <Button className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Novo Imóvel
          </Button>
        </Link>
      </div>

      {imoveis.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">Você ainda não cadastrou nenhum imóvel.</p>
            <Link href="/corretor/imoveis/novo">
              <Button>Cadastrar Primeiro Imóvel</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {imoveis.map((imovel) => (
            <Card key={imovel.id}>
              <div className="flex flex-col h-full">
                {/* Image Preview */}
                {imovel.images && imovel.images.length > 0 && (
                  <div className="relative h-48 -m-6 mb-4 overflow-hidden rounded-t-xl">
                    <img
                      src={imovel.images[0]}
                      alt={imovel.titulo}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                        imovel.status === 'ATIVO'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}
                    >
                      {imovel.status}
                    </span>
                  </div>
                )}
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {imovel.titulo}
                </h3>
                
                <div className="flex-1 space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Tipo:</span>{' '}
                    {imovel.tipo === 'VENDA' ? 'Venda' : 'Aluguel'}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {Number(imovel.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p>
                    <span className="font-medium">Localização:</span>{' '}
                    {imovel.cidade}, {imovel.estado}
                  </p>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Link href={`/corretor/imoveis/${imovel.id}/editar`} className="flex-1">
                    <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(imovel.id)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deletar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
