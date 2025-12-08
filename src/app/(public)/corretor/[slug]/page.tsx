import { prisma } from '@/lib/prisma'
import { getCorretorBySlug } from '@/lib/corretor'
import { Card } from '@/components/ui/Card'
import { ImovelCard } from '@/components/ui/ImovelCard'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Phone, MessageCircle, Building2 } from 'lucide-react'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const corretor = await getCorretorBySlug(slug, { includeImoveis: false })

    if (!corretor) {
      return {
        title: 'Corretor não encontrado'
      }
    }

    const imoveisCount = (corretor.imoveis || []).length
    const description = corretor.bio || `${corretor.user?.name || ''} - Corretor de Imóveis em ${corretor.cidade || 'sua região'}. ${imoveisCount} ${imoveisCount === 1 ? 'imóvel disponível' : 'imóveis disponíveis'} para venda e aluguel.`

    return {
      title: `${corretor.user?.name || ''} - Imóveis para Venda e Aluguel${corretor.cidade ? ` em ${corretor.cidade}` : ''}`,
      description,
      keywords: ['imóveis', 'venda', 'aluguel', 'corretor', corretor.cidade, corretor.user?.name, 'comprar casa', 'alugar apartamento'].filter(Boolean).join(', '),
      openGraph: {
        title: `${corretor.user?.name || ''} - Corretor de Imóveis`,
        description,
        images: corretor.photo ? [corretor.photo] : [],
        type: 'profile',
        locale: 'pt_BR'
      },
      twitter: {
        card: 'summary',
        title: `${corretor.user?.name || ''} - Corretor de Imóveis`,
        description,
        images: corretor.photo ? [corretor.photo] : []
      }
    }
  } catch (err) {
    console.error('generateMetadata error (corretor page):', err)
    return {
      title: 'Corretor',
      description: 'Perfil do corretor'
    }
  }
}

export default async function CorretorPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const corretorRaw = await getCorretorBySlug(slug, { includeImoveis: true, includeLandingCount: true })

  if (!corretorRaw) {
    notFound()
  }

  // Converter Decimal para número nos imóveis
  const corretor = {
    ...corretorRaw,
    imoveis: corretorRaw.imoveis.map((imovel: any) => ({
      ...imovel,
      valor: Number(imovel.valor)
    }))
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
        {/* Perfil do Corretor */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              {corretor.photo ? (
                <img
                  src={corretor.photo}
                  alt={corretor.user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center border-4 border-blue-200">
                  <span className="text-5xl font-bold text-blue-600">
                    {corretor.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {corretor.user.name}
              </h1>
              
              {corretor.cidade && (
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="w-5 h-5" />
                  <span>{corretor.cidade}</span>
                </div>
              )}
              
              {corretor.bio && (
                <p className="text-gray-700 mb-4 leading-relaxed">{corretor.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-3">
                {corretor.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                    <Phone className="w-4 h-4" />
                    <span>{corretor.phone}</span>
                  </div>
                )}
                
                {corretor.whatsapp && (
                  <a
                    href={`https://wa.me/55${corretor.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contatar via WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation to Landing Page - if active */}
        {corretorRaw.landingAtiva && corretorRaw.landingBlocos && corretorRaw.landingBlocos.length > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Conheça Nossa Empresa
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Descubra mais sobre nossa história, valores e o que nos torna únicos no mercado imobiliário
              </p>
              <Link
                href={`/lp/${corretor.slug}`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Building2 className="w-6 h-6" />
                CONHEÇA NOSSA EMPRESA
              </Link>
            </div>
          </Card>
        )}

        {/* Imóveis do Corretor */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Imóveis Disponíveis
            </h2>
            <span className="text-lg text-gray-600">
              {corretor.imoveis.length} {corretor.imoveis.length === 1 ? 'imóvel' : 'imóveis'}
            </span>
          </div>

          {corretor.imoveis.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-12">
                Este corretor ainda não possui imóveis cadastrados.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {corretor.imoveis.map((imovel: { 
                id: string; 
                titulo: string; 
                valor: number; 
                tipo: string; 
              }) => (
                <ImovelCard
                  key={imovel.id}
                  imovel={imovel as any}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Portal Imobiliário. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
