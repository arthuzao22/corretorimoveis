'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { getAllImoveisAdmin } from '@/server/actions/admin'

type Imovel = {
  id: string
  titulo: string
  tipo: string
  status: string
  valor: number
  cidade: string
  estado: string
  corretor: {
    user: {
      name: string
      email: string
    }
  }
}

export default function ImoveisAdminPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [loading, setLoading] = useState(true)

  const loadImoveis = async () => {
    const result = await getAllImoveisAdmin()
    if (result.success && result.imoveis) {
      setImoveis(result.imoveis as any)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadImoveis()
  }, [])

  if (loading) {
    return <div className="text-center py-10 text-slate-500">Carregando...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Todos os Imóveis</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Visualização consolidada dos imóveis cadastrados por todos os corretores.</p>
      </div>

      {imoveis.length === 0 ? (
        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-center text-slate-500 py-8">
            Nenhum imóvel cadastrado ainda.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {imoveis.map((imovel) => (
            <Card key={imovel.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
              <div className="flex flex-col h-full">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {imovel.titulo}
                </h3>
                <div className="flex-1 space-y-2 text-sm text-slate-600">
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
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                        imovel.status === 'ATIVO'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {imovel.status}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Corretor:</span>{' '}
                    {imovel.corretor.user.name}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
