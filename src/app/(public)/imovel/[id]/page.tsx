'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { createLead } from '@/server/actions/leads'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { MapPin, DollarSign, Home, X } from 'lucide-react'

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
  images: string[]
  views: number
  corretor: {
    slug: string
    whatsapp?: string
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
  useEffect(() => {
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
  }, [params])

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

  const handleWhatsAppContact = () => {
    if (imovel?.corretor.whatsapp) {
      const phone = imovel.corretor.whatsapp.replace(/\D/g, '')
      const message = `Olá! Tenho interesse no imóvel: ${imovel.titulo}`
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank')
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <ImageGallery images={imovel.images} alt={imovel.titulo} />

            {/* Title and Price */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {imovel.titulo}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{imovel.endereco}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {imovel.cidade}, {imovel.estado}
                    {imovel.cep && ` - CEP: ${imovel.cep}`}
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  imovel.tipo === 'VENDA' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {imovel.tipo === 'VENDA' ? 'Venda' : 'Aluguel'}
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-baseline gap-2">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  <span className="text-4xl font-bold text-blue-600">
                    R$ {Number(imovel.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Descrição</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{imovel.descricao}</p>
            </Card>

            {/* Views */}
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span>{imovel.views} visualizações</span>
            </div>
          </div>

          {/* Sidebar - Contact */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Corretor Responsável</h3>
                <div className="mb-6">
                  <p className="font-semibold text-gray-900 text-lg">{imovel.corretor.user.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{imovel.corretor.user.email}</p>
                </div>

                {imovel.corretor.whatsapp && (
                  <Button
                    onClick={handleWhatsAppContact}
                    className="w-full mb-3 bg-green-600 hover:bg-green-700"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Contatar via WhatsApp
                  </Button>
                )}

                {!showContactForm ? (
                  <Button
                    className="w-full"
                    onClick={() => setShowContactForm(true)}
                  >
                    TENHO INTERESSE
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Entre em contato</h4>
                      <button
                        onClick={() => setShowContactForm(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
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
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full"
                      >
                        {submitting ? 'Enviando...' : 'Enviar Contato'}
                      </Button>
                    </form>
                  </div>
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
    </div>
  )
}
