import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { ContactForm } from '@/components/property/ContactForm'
import { PropertyDetails } from '@/components/property/PropertyDetails'
import { GoogleMapsIframe } from '@/components/maps/GoogleMapsIframe'
import Link from 'next/link'
import { Building2, MapPin, Phone, MessageCircle, User } from 'lucide-react'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PropertyDetailSkeleton } from '@/components/skeletons'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'

export const dynamic = 'force-dynamic'

async function getImovel(id: string) {
  // Increment views
  await prisma.imovel.update({
    where: { id },
    data: { views: { increment: 1 } }
  }).catch(() => {})

  const imovel = await prisma.imovel.findUnique({
    where: { id },
    include: {
      corretor: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      }
    }
  })

  if (!imovel) {
    return null
  }

  // Convert Decimal to number
  return {
    ...imovel,
    valor: Number(imovel.valor),
    area: imovel.area ? Number(imovel.area) : null,
    latitude: imovel.latitude ? Number(imovel.latitude) : null,
    longitude: imovel.longitude ? Number(imovel.longitude) : null,
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const imovel = await getImovel(resolvedParams.id)

  if (!imovel) {
    return {
      title: 'Imóvel não encontrado',
    }
  }

  const description = imovel.descricao.slice(0, 160)
  const imageUrl = imovel.images[0] || '/placeholder-property.jpg'

  return {
    title: `${imovel.titulo} - ${imovel.cidade}, ${imovel.estado}`,
    description,
    openGraph: {
      title: imovel.titulo,
      description,
      images: [imageUrl],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: imovel.titulo,
      description,
      images: [imageUrl],
    },
  }
}

async function PropertyContent({ id }: { id: string }) {
  const imovel = await getImovel(id)

  if (!imovel) {
    notFound()
  }

  const whatsappMessage = `Olá! Tenho interesse no imóvel: ${imovel.titulo} - ${imovel.cidade}, ${imovel.estado}`
  const whatsappUrl = imovel.corretor.whatsapp
    ? `https://wa.me/55${imovel.corretor.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
    : null

  // Verificar se deve exibir o mapa (validação server-side)
  const shouldShowMap = Boolean(
    imovel.endereco && 
    imovel.endereco.trim().length >= 5 && 
    imovel.cidade && 
    imovel.cidade.trim().length >= 2
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <Navbar />

      <div className="flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Gallery */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <ImageGallery images={imovel.images} alt={imovel.titulo} />
            </div>

            {/* Title and Price */}
            <div className="bg-white rounded-2xl shadow-sm p-5 lg:p-6 border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                    {imovel.titulo}
                  </h1>
                  <div className="flex items-start gap-2 text-slate-600">
                    <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-slate-400" />
                    <div>
                      <p className="text-slate-700">{imovel.endereco}</p>
                      <p className="text-sm text-slate-500">
                        {imovel.cidade}, {imovel.estado}
                        {imovel.cep && ` - CEP: ${imovel.cep}`}
                      </p>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap ${
                  imovel.tipo === 'VENDA' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}>
                  {imovel.tipo === 'VENDA' ? 'Venda' : 'Aluguel'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <p className="text-sm text-slate-500 font-medium mb-1">Valor do Imovel</p>
                <p className="text-3xl sm:text-4xl font-bold text-slate-900">
                  R$ {imovel.valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            {/* Property Details */}
            <PropertyDetails imovel={imovel} />

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm p-5 lg:p-6 border border-slate-100">
              <h2 className="text-xl font-bold mb-4 text-slate-800">Descricao</h2>
              <p className="text-slate-600 whitespace-pre-line leading-relaxed">{imovel.descricao}</p>
            </div>

            {/* Localizacao com Google Maps Iframe */}
            {shouldShowMap && (
              <div className="bg-white rounded-2xl shadow-sm p-5 lg:p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-bold text-slate-800">Localizacao</h2>
                </div>
                
                <GoogleMapsIframe
                  endereco={imovel.endereco}
                  bairro={imovel.bairro || undefined}
                  cidade={imovel.cidade}
                  estado={imovel.estado}
                  cep={imovel.cep || undefined}
                  height="400px"
                  className="rounded-xl shadow-sm"
                />
                
                <div className="mt-4">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      [imovel.endereco, imovel.bairro, imovel.cidade, imovel.estado]
                        .filter(Boolean)
                        .join(', ')
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium text-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    Abrir no Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Contact */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Corretor Info */}
              <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl font-bold text-indigo-600">
                      {imovel.corretor.user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Corretor</p>
                    <p className="font-bold text-slate-800">{imovel.corretor.user.name}</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  )}

                  <a
                    href={`tel:${imovel.corretor.whatsapp || ''}`}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-medium text-sm shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    Ligar
                  </a>

                  <Link
                    href={`/corretor/${imovel.corretor.slug}`}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm"
                  >
                    <User className="w-4 h-4" />
                    Ver Perfil
                  </Link>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
                <h3 className="text-lg font-bold mb-2 text-slate-800">
                  Tenho Interesse
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Deixe seus dados e o corretor entrara em contato.
                </p>
                <ContactForm imovelId={imovel.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  )
}

export default async function ImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  
  return (
    <Suspense fallback={<PropertyDetailSkeleton />}>
      <PropertyContent id={resolvedParams.id} />
    </Suspense>
  )
}
