'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createLead } from '@/server/actions/leads'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

type Imovel = {
  id: string
  titulo: string
  descricao: string
  tipo: string
  valor: number
  endereco: string
  cidade: string
  estado: string
  cep?: string
  fotos: string[]
  views: number
  corretor: {
    slug: string
    user: {
      name: string
      email: string
    }
  }
}

export default function ImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [imovel, setImovel] = useState<Imovel | null>(null)
  const [loading, setLoading] = useState(true)
  const [showContactForm, setShowContactForm] = useState(false)
  const [imovelId, setImovelId] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Carregar imóvel
  useState(() => {
    async function loadImovel() {
      try {
        const resolvedParams = await params
        setImovelId(resolvedParams.id)
        const response = await fetch(`/api/imoveis/${resolvedParams.id}`)
        if (response.ok) {
          const data = await response.json()
          setImovel(data)
        }
      } catch (error) {
        console.error('Erro ao carregar imóvel:', error)
      } finally {
        setLoading(false)
      }
    }
    loadImovel()
  })

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const result = await createLead({
        imovelId,
        ...formData
      })

      if (result.success) {
        alert('Contato enviado com sucesso! O corretor entrará em contato em breve.')
        setShowContactForm(false)
        setFormData({ name: '', email: '', phone: '', message: '' })
      } else {
        alert(result.error || 'Erro ao enviar contato')
      }
    } catch (error) {
      alert('Erro ao enviar contato')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!imovel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <p className="text-center py-8">Imóvel não encontrado</p>
          <div className="text-center">
            <Link href="/">
              <Button>Voltar para Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Portal Imobiliário
          </Link>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações do Imóvel */}
          <div className="lg:col-span-2">
            <Card>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {imovel.titulo}
              </h1>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">
                  R$ {Number(imovel.valor).toLocaleString('pt-BR')}
                </span>
                <span className="ml-2 text-gray-600">
                  / {imovel.tipo === 'VENDA' ? 'Venda' : 'Aluguel'}
                </span>
              </div>

              <div className="space-y-4 text-gray-700">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Descrição</h2>
                  <p className="whitespace-pre-line">{imovel.descricao}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Localização</h2>
                  <p>{imovel.endereco}</p>
                  <p>
                    {imovel.cidade}, {imovel.estado}
                    {imovel.cep && ` - CEP: ${imovel.cep}`}
                  </p>
                </div>

                <div className="text-sm text-gray-500">
                  <p>Visualizações: {imovel.views}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Contato */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <h3 className="text-xl font-semibold mb-4">Corretor</h3>
              <div className="mb-4">
                <p className="font-medium text-gray-900">{imovel.corretor.user.name}</p>
                <p className="text-sm text-gray-600">{imovel.corretor.user.email}</p>
              </div>

              {!showContactForm ? (
                <Button 
                  className="w-full"
                  onClick={() => setShowContactForm(true)}
                >
                  Tenho Interesse
                </Button>
              ) : (
                <form onSubmit={handleSubmitLead} className="space-y-4">
                  <Input
                    label="Nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={submitting}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={submitting}
                  />
                  <Input
                    label="Telefone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    disabled={submitting}
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Mensagem (opcional)
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowContactForm(false)}
                      disabled={submitting}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? 'Enviando...' : 'Enviar'}
                    </Button>
                  </div>
                </form>
              )}

              <div className="mt-4 pt-4 border-t">
                <Link href={`/corretor/${imovel.corretor.slug}`}>
                  <Button variant="secondary" className="w-full">
                    Ver Perfil do Corretor
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
