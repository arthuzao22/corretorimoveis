import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Building2, MapPin, TrendingUp, Users, Home as HomeIcon, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const imoveisRaw = await prisma.imovel.findMany({
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

  // Converter Decimal para número
  const imoveis = imoveisRaw.map(imovel => ({
    ...imovel,
    valor: Number(imovel.valor)
  }))

  const totalImoveis = await prisma.imovel.count({ where: { status: 'ATIVO' } })
  const totalCorretores = await prisma.corretorProfile.count({ where: { approved: true } })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              <Building2 className="w-8 h-8" />
              <span>ImóvelPro</span>
            </Link>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-all font-medium"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
              >
                Cadastrar-se
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAgMS4xMDUtLjg5NSAyLTIgMnMtMi0uODk1LTItMiAuODk1LTIgMi0yIDIgLjg5NSAyIDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Seu Próximo Lar Está Aqui
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto">
            Conecte-se diretamente com corretores especializados e encontre o imóvel perfeito para você
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#imoveis"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl font-semibold text-lg flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Ver Imóveis
            </Link>
            <Link
              href="/register"
              className="bg-blue-500/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg hover:bg-blue-500/30 transition-all border-2 border-white/30 font-semibold text-lg flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Sou Corretor
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
              <HomeIcon className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{totalImoveis}+</h3>
            <p className="text-gray-600 font-medium">Imóveis Disponíveis</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
              <Users className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{totalCorretores}+</h3>
            <p className="text-gray-600 font-medium">Corretores Parceiros</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full mb-4">
              <TrendingUp className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">98%</h3>
            <p className="text-gray-600 font-medium">Satisfação de Clientes</p>
          </div>
        </div>
      </section>

      {/* Imoveis Section */}
      <section id="imoveis" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Imóveis em Destaque
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubra as melhores oportunidades selecionadas especialmente para você
          </p>
        </div>

        {imoveis.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <HomeIcon className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">
              Nenhum imóvel disponível no momento. Em breve teremos novidades!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {imoveis.map((imovel: any) => (
              <Link key={imovel.id} href={`/imovel/${imovel.id}`}>
                <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-52 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                    {imovel.images && imovel.images.length > 0 ? (
                      <img
                        src={imovel.images[0]}
                        alt={imovel.titulo}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building2 className="w-16 h-16 text-blue-300" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        {imovel.tipo === 'VENDA' ? 'Venda' : 'Aluguel'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {imovel.titulo}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{imovel.cidade}, {imovel.estado}</span>
                    </div>

                    <div className="mt-auto">
                      <p className="text-3xl font-bold text-blue-600 mb-3">
                        R$ {Number(imovel.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-600">
                              {imovel.corretor.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {imovel.corretor.user.name}
                          </span>
                        </div>
                        <span className="text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                          Ver mais →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {imoveis.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="#"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-semibold"
            >
              Ver Todos os Imóveis
              <Search className="w-5 h-5" />
            </Link>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Você é um Corretor?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Cadastre-se gratuitamente e comece a anunciar seus imóveis hoje mesmo
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl font-semibold text-lg"
          >
            <Users className="w-5 h-5" />
            Criar Conta Grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
                <Building2 className="w-6 h-6" />
                <span>ImóvelPro</span>
              </div>
              <p className="text-sm">
                A melhor plataforma para encontrar seu imóvel dos sonhos.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">Início</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Entrar</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Cadastrar</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Para Corretores</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register" className="hover:text-white transition-colors">Criar Conta</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Área do Corretor</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-sm">
                <li>contato@imovelpro.com.br</li>
                <li>(11) 99999-9999</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 ImóvelPro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
