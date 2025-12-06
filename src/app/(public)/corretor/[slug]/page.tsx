import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CorretorPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const corretor = await prisma.corretorProfile.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          name: true,
          email: true
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

  if (!corretor) {
    notFound()
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
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-600">
                  {corretor.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {corretor.user.name}
              </h1>
              <p className="text-gray-600 mb-4">{corretor.user.email}</p>
              {corretor.bio && (
                <p className="text-gray-700">{corretor.bio}</p>
              )}
              {corretor.phone && (
                <p className="text-gray-600 mt-2">
                  <span className="font-medium">Telefone:</span> {corretor.phone}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Imóveis do Corretor */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Imóveis Disponíveis ({corretor.imoveis.length})
          </h2>

          {corretor.imoveis.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-8">
                Este corretor ainda não possui imóveis cadastrados.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {corretor.imoveis.map((imovel: any) => (
                <Link key={imovel.id} href={`/imovel/${imovel.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {imovel.titulo}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="text-2xl font-bold text-blue-600">
                        R$ {Number(imovel.valor).toLocaleString('pt-BR')}
                      </p>
                      <p>
                        <span className="font-medium">Tipo:</span>{' '}
                        {imovel.tipo === 'VENDA' ? 'Venda' : 'Aluguel'}
                      </p>
                      <p>
                        <span className="font-medium">Localização:</span>{' '}
                        {imovel.cidade}, {imovel.estado}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {imovel.views} visualizações
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Portal Imobiliário. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
