import { getPublicLanding } from '@/server/actions/landing'
import { notFound } from 'next/navigation'
import { HeroBloco } from '@/components/landing/blocks/HeroBloco'
import { HistoriaBloco } from '@/components/landing/blocks/HistoriaBloco'
import { GaleriaBloco } from '@/components/landing/blocks/GaleriaBloco'
import { CTABloco } from '@/components/landing/blocks/CTABloco'
import { ImoveisBloco } from '@/components/landing/blocks/ImoveisBloco'
import { VideoBloco } from '@/components/landing/blocks/VideoBloco'
import { TextoBloco } from '@/components/landing/blocks/TextoBloco'
import { ContatoBloco } from '@/components/landing/blocks/ContatoBloco'
import { MessageCircle, Building2 } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const result = await getPublicLanding(slug)

  if (!result.success || !result.corretor) {
    return {
      title: 'Landing Page não encontrada'
    }
  }

  const corretor = result.corretor
  const heroBlock = corretor.landingBlocos.find((b: any) => b.tipo === 'hero')
  const description = heroBlock?.subtitulo || heroBlock?.texto || `Conheça os imóveis de ${corretor.user.name}`
  const image = heroBlock?.imagens?.[0]

  return {
    title: `${corretor.user.name} - Corretor de Imóveis`,
    description,
    openGraph: {
      title: `${corretor.user.name} - Corretor de Imóveis`,
      description,
      images: image ? [image] : [],
      type: 'website'
    }
  }
}

export default async function PublicLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await getPublicLanding(slug)

  if (!result.success || !result.corretor) {
    notFound()
  }

  const corretor = result.corretor

  const renderBloco = (bloco: any) => {
    switch (bloco.tipo) {
      case 'hero':
        return <HeroBloco key={bloco.id} bloco={bloco} whatsapp={corretor.whatsapp} />
      
      case 'historia':
      case 'carrossel':
        return <HistoriaBloco key={bloco.id} bloco={bloco} />
      
      case 'galeria':
        return <GaleriaBloco key={bloco.id} bloco={bloco} />
      
      case 'cta':
        return <CTABloco key={bloco.id} bloco={bloco} whatsapp={corretor.whatsapp} />
      
      case 'imoveis':
        return <ImoveisBloco key={bloco.id} bloco={bloco} imoveis={corretor.imoveis} />
      
      case 'video':
        return <VideoBloco key={bloco.id} bloco={bloco} />
      
      case 'texto':
        return <TextoBloco key={bloco.id} bloco={bloco} />
      
      case 'contato':
        return <ContatoBloco key={bloco.id} bloco={bloco} corretorId={corretor.id} whatsapp={corretor.whatsapp} />
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Render blocos dinamicamente */}
      {corretor.landingBlocos.map(renderBloco)}

      {/* Navigation to Profile - Ver Todos os Imóveis */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Conheça Todos os Nossos Imóveis
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Veja nossa carteira completa de imóveis disponíveis para venda e aluguel
          </p>
          <Link
            href={`/corretor/${corretor.slug}`}
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Building2 className="w-6 h-6" />
            VER TODOS OS IMÓVEIS
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">{corretor.user.name}</h3>
            {corretor.cidade && (
              <p className="text-gray-400 mb-6">{corretor.cidade}</p>
            )}
            {corretor.whatsapp && (
              <a
                href={`https://wa.me/55${corretor.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Entrar em Contato
              </a>
            )}
            <div className="mt-8 pt-8 border-t border-gray-800 text-gray-400 text-sm">
              <p>&copy; 2024 {corretor.user.name}. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      {corretor.whatsapp && (
        <a
          href={`https://wa.me/55${corretor.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 p-4 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50"
          title="Fale conosco no WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      )}
    </div>
  )
}
