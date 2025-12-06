'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getAllCorretores, approveCorretor, toggleUserActive } from '@/server/actions/admin'

type Corretor = {
  id: string
  slug: string
  approved: boolean
  user: {
    id: string
    name: string
    email: string
    active: boolean
    createdAt: Date
  }
  _count: {
    imoveis: number
    leads: number
  }
}

export default function CorretoresPage() {
  const [corretores, setCorretores] = useState<Corretor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCorretores()
  }, [])

  const loadCorretores = async () => {
    const result = await getAllCorretores()
    if (result.success && result.corretores) {
      setCorretores(result.corretores as any)
    }
    setLoading(false)
  }

  const handleApprove = async (corretorId: string) => {
    const result = await approveCorretor(corretorId)
    if (result.success) {
      loadCorretores()
    } else {
      alert(result.error)
    }
  }

  const handleToggleActive = async (userId: string) => {
    const result = await toggleUserActive(userId)
    if (result.success) {
      loadCorretores()
    } else {
      alert(result.error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gerenciar Corretores</h1>

      {corretores.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            Nenhum corretor cadastrado ainda.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {corretores.map((corretor) => (
            <Card key={corretor.id}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {corretor.user.name}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Email:</span> {corretor.user.email}
                    </p>
                    <p>
                      <span className="font-medium">Slug:</span> {corretor.slug}
                    </p>
                    <p>
                      <span className="font-medium">Imóveis:</span> {corretor._count.imoveis}
                    </p>
                    <p>
                      <span className="font-medium">Leads:</span> {corretor._count.leads}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          corretor.user.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {corretor.user.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Aprovado:</span>{' '}
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          corretor.approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {corretor.approved ? 'Sim' : 'Pendente'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {!corretor.approved && (
                    <Button
                      onClick={() => handleApprove(corretor.id)}
                      className="whitespace-nowrap"
                    >
                      Aprovar
                    </Button>
                  )}
                  <Button
                    variant={corretor.user.active ? 'danger' : 'secondary'}
                    onClick={() => handleToggleActive(corretor.user.id)}
                    className="whitespace-nowrap"
                  >
                    {corretor.user.active ? 'Desativar' : 'Ativar'}
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
