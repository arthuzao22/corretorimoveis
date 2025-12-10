import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { ContactForm } from '@/components/property/ContactForm'
import { PropertyDetails } from '@/components/property/PropertyDetails'
import { PropertyMap } from '@/components/property/PropertyMap'
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Navbar />

      <div className="flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <ImageGallery images={imovel.images} alt={imovel.titulo} />

            {/* Title and Price */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {imovel.titulo}
                  </h1>
                  <div className="flex items-start gap-2 text-gray-600 mb-2">
                    <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <p>{imovel.endereco}</p>
                      <p className="text-sm text-gray-500">
                        {imovel.cidade}, {imovel.estado}
                        {imovel.cep && ` - CEP: ${imovel.cep}`}
                      </p>
                    </div>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                  imovel.tipo === 'VENDA' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {imovel.tipo === 'VENDA' ? 'Venda' : 'Aluguel'}
                </span>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                <p className="text-sm text-blue-700 font-medium mb-1">Valor do Imóvel</p>
                <p className="text-4xl font-bold text-blue-600">
                  R$ {imovel.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Property Details */}
            <PropertyDetails imovel={imovel} />

            {/* Description */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Descrição</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{imovel.descricao}</p>
            </div>

            {/* Map */}
            {imovel.latitude && imovel.longitude && (
              <PropertyMap
                latitude={imovel.latitude}
                longitude={imovel.longitude}
                title={imovel.titulo}
              />
            )}
          </div>

          {/* Sidebar - Contact */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Corretor Info */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Corretor Responsável</p>
                    <p className="font-bold text-gray-900 text-lg">{imovel.corretor.user.name}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Falar no WhatsApp
                    </a>
                  )}

                  <a
                    href={`tel:${imovel.corretor.whatsapp || ''}`}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
                  >
                    <Phone className="w-5 h-5" />
                    Ligar Agora
                  </a>

                  <Link
                    href={`/corretor/${imovel.corretor.slug}`}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <User className="w-5 h-5" />
                    Ver Perfil
                  </Link>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Tenho Interesse
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Deixe seus dados e o corretor entrará em contato com você.
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
