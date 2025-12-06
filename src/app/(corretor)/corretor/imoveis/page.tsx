'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getMyImoveis, deleteImovel } from '@/server/actions/imoveis'
import Link from 'next/link'

type Imovel = {
  id: string
  titulo: string
  tipo: string
  status: string
  valor: number
  cidade: string
  estado: string
  createdAt: Date
}

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadImoveis()
  }, [])

  const loadImoveis = async () => {
    const result = await getMyImoveis()
    if (result.success && result.imoveis) {
      setImoveis(result.imoveis as any)
    }
    setLoading(false)
  }

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
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Meus Imóveis</h1>
        <Link href="/corretor/imoveis/novo">
          <Button>+ Novo Imóvel</Button>
        </Link>
      </div>

      {imoveis.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            Você ainda não cadastrou nenhum imóvel.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {imoveis.map((imovel) => (
            <Card key={imovel.id}>
              <div className="flex flex-col h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {imovel.titulo}
                </h3>
                <div className="flex-1 space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Tipo:</span>{' '}
                    {imovel.tipo === 'VENDA' ? 'Venda' : 'Aluguel'}
                  </p>
                  <p>
                    <span className="font-medium">Valor:</span>{' '}
                    R$ {Number(imovel.valor).toLocaleString('pt-BR')}
                  </p>
                  <p>
                    <span className="font-medium">Localização:</span>{' '}
                    {imovel.cidade}, {imovel.estado}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        imovel.status === 'ATIVO'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {imovel.status}
                    </span>
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/corretor/imoveis/${imovel.id}/editar`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(imovel.id)}
                    className="flex-1"
                  >
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
