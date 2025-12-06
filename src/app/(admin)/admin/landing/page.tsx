'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { getAllLandingPages, toggleLandingActive } from '@/server/actions/landing'
import { Eye, Edit, Power, ExternalLink } from 'lucide-react'

interface CorretorLanding {
  id: string
  slug: string
  cidade: string | null
  landingAtiva: boolean
  temaCor: string | null
  fundoCor: string | null
  tituloLP: string | null
  user: {
    name: string
    email: string
  }
  _count: {
    imoveis: number
  }
}

export default function AdminLandingPage() {
  const [corretores, setCorretores] = useState<CorretorLanding[]>([])
  const [loading, setLoading] = useState(true)

  const loadLandingPages = async () => {
    setLoading(true)
    const result = await getAllLandingPages()
    if (result.success && result.corretores) {
      setCorretores(result.corretores)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadLandingPages()
  }, [])

  const handleToggleActive = async (corretorId: string) => {
    const result = await toggleLandingActive(corretorId)
    if (result.success) {
      loadLandingPages()
    } else {
      alert(result.error || 'Erro ao atualizar status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gerenciar Landing Pages
        </h1>
        <p className="text-gray-600">
          Configure e gerencie as landing pages de cada corretor
        </p>
      </div>

      <div className="grid gap-4">
        {corretores.map((corretor) => (
          <Card key={corretor.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {corretor.user.name}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      corretor.landingAtiva
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {corretor.landingAtiva ? 'Ativa' : 'Pausada'}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>
                    <strong>Email:</strong> {corretor.user.email}
                  </span>
                  {corretor.cidade && (
                    <span>
                      <strong>Cidade:</strong> {corretor.cidade}
                    </span>
                  )}
                  <span>
                    <strong>Slug:</strong> /{corretor.slug}
                  </span>
                  <span>
                    <strong>Imóveis:</strong> {corretor._count.imoveis}
                  </span>
                </div>

                <div className="flex gap-2 mt-2">
                  {corretor.temaCor && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: corretor.temaCor }}
                      />
                      Cor tema
                    </div>
                  )}
                  {corretor.fundoCor && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: corretor.fundoCor }}
                      />
                      Cor fundo
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/lp/${corretor.slug}`} target="_blank">
                  <Button variant="secondary">
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                </Link>

                <Link href={`/admin/landing/${corretor.id}`}>
                  <Button variant="primary">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                </Link>

                <Button
                  variant={corretor.landingAtiva ? 'secondary' : 'primary'}
                  onClick={() => handleToggleActive(corretor.id)}
                >
                  <Power className="w-4 h-4 mr-1" />
                  {corretor.landingAtiva ? 'Pausar' : 'Ativar'}
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {corretores.length === 0 && (
          <Card>
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">Nenhum corretor cadastrado ainda.</p>
              <Link href="/admin/corretores">
                <Button variant="primary">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Gerenciar Corretores
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
