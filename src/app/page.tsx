import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const imoveis = await prisma.imovel.findMany({
    where: {
      status: 'ATIVO'
    },
    include: {
      corretor: {
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 6
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Portal Imobiliário
            </Link>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 px-4 py-2"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Encontre o Imóvel dos Seus Sonhos
          </h1>
          <p className="text-xl mb-8">
            Conecte-se diretamente com corretores especializados
          </p>
        </div>
      </section>

      {/* Imoveis */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Imóveis em Destaque
        </h2>

        {imoveis.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">
              Nenhum imóvel disponível no momento.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imoveis.map((imovel: any) => (
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
                    <p className="text-xs text-gray-500">
                      Corretor: {imovel.corretor.user.name}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Portal Imobiliário. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
