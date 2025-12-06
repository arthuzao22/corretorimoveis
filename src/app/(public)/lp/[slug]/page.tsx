import { prisma } from '@/lib/prisma'
import { ImovelCard } from '@/components/ui/ImovelCard'
import { notFound } from 'next/navigation'
import { MapPin, Phone, MessageCircle } from 'lucide-react'

export default async function PublicLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const corretorRaw = await prisma.corretorProfile.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          name: true
        }
      },
      imoveis: {
        where: {
          status: 'ATIVO'
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!corretorRaw) {
    notFound()
  }

  // Se landing não está ativa, mostrar mensagem
  if (!corretorRaw.landingAtiva) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Landing Page Temporariamente Indisponível
          </h1>
          <p className="text-gray-600">
            Esta página está pausada no momento. Entre em contato diretamente com o corretor.
          </p>
        </div>
      </div>
    )
  }

  // Converter Decimal para número nos imóveis
  const corretor = {
    ...corretorRaw,
    imoveis: corretorRaw.imoveis.map(imovel => ({
      ...imovel,
      valor: Number(imovel.valor)
    }))
  }

  const temaCor = corretor.temaCor || '#3B82F6'
  const fundoCor = corretor.fundoCor || '#F9FAFB'
  const tituloLP = corretor.tituloLP || 'Encontre o Imóvel dos Seus Sonhos'
  const subtituloLP = corretor.subtituloLP || 'Imóveis de qualidade com atendimento personalizado'
  const textoCTA = corretor.textoCTA || 'Ver Imóveis Disponíveis'

  return (
    <div className="min-h-screen" style={{ backgroundColor: fundoCor }}>
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: temaCor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {corretor.logoUrl ? (
            <img
              src={corretor.logoUrl}
              alt="Logo"
              className="h-12 object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          ) : (
            <div className="text-2xl font-bold text-white">
              {corretor.user.name}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16" style={{ backgroundColor: temaCor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-6">
              {tituloLP}
            </h1>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              {subtituloLP}
            </p>

            {corretor.cidade && (
              <div className="flex items-center justify-center gap-2 text-lg mb-8 opacity-90">
                <MapPin className="w-6 h-6" />
                <span>{corretor.cidade}</span>
              </div>
            )}

            <a href="#imoveis">
              <button
                className="px-8 py-4 bg-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
                style={{ color: temaCor }}
              >
                {textoCTA}
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Banner */}
      {corretor.bannerUrl && (
        <section className="w-full h-96 overflow-hidden">
          <img
            src={corretor.bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </section>
      )}

      {/* Contact Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${temaCor}20` }}
              >
                <Phone className="w-8 h-8" style={{ color: temaCor }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Corretor</p>
                <p className="text-xl font-semibold text-gray-900">
                  {corretor.user.name}
                </p>
              </div>
            </div>

            {corretor.whatsapp && (
              <a
                href={`https://wa.me/55${corretor.whatsapp.replace(/\D/g, '')}?text=Olá! Vi sua landing page e gostaria de mais informações sobre os imóveis.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Falar no WhatsApp</span>
              </a>
            )}

            {corretor.phone && !corretor.whatsapp && (
              <div className="flex items-center gap-2 text-gray-700 bg-gray-100 px-6 py-3 rounded-lg">
                <Phone className="w-5 h-5" />
                <span className="font-semibold">{corretor.phone}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Imóveis Section */}
      <section id="imoveis" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Imóveis Disponíveis
            </h2>
            <p className="text-xl text-gray-600">
              {corretor.imoveis.length} {corretor.imoveis.length === 1 ? 'imóvel' : 'imóveis'} para você
            </p>
          </div>

          {corretor.imoveis.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500 text-lg">
                Novos imóveis em breve. Entre em contato para mais informações!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {corretor.imoveis.map((imovel) => (
                <ImovelCard
                  key={imovel.id}
                  id={imovel.id}
                  titulo={imovel.titulo}
                  valor={imovel.valor}
                  tipo={imovel.tipo}
                  cidade={imovel.cidade}
                  estado={imovel.estado}
                  images={imovel.images}
                  views={imovel.views}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 text-white" style={{ backgroundColor: temaCor }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Encontrou o imóvel ideal?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Entre em contato agora e agende uma visita!
          </p>
          
          {corretor.whatsapp && (
            <a
              href={`https://wa.me/55${corretor.whatsapp.replace(/\D/g, '')}?text=Olá! Vi um imóvel na sua landing page e gostaria de agendar uma visita.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
              style={{ color: temaCor }}
            >
              <MessageCircle className="w-6 h-6" />
              <span>Falar no WhatsApp</span>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} {corretor.user.name}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
