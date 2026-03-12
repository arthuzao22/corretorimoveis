import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  Building2,
  MapPin,
  TrendingUp,
  Users,
  Home as HomeIcon,
  Search,
  Shield,
  Clock,
  Star,
  ArrowRight,
  CheckCircle2,
  Bed,
  Bath,
  Maximize,
} from 'lucide-react'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const imoveisRaw = await prisma.imovel.findMany({
    where: {
      status: 'ATIVO',
    },
    include: {
      corretor: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: [
      { destaque: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 6,
  })

  const imoveis = imoveisRaw.map((imovel) => ({
    ...imovel,
    valor: Number(imovel.valor),
    area: imovel.area ? Number(imovel.area) : null,
  }))

  const totalImoveis = await prisma.imovel.count({ where: { status: 'ATIVO' } })
  const totalCorretores = await prisma.corretorProfile.count({ where: { approved: true } })

  return (
    <div className="min-h-screen bg-white">
      <Navbar transparent />

      {/* ========== HERO SECTION ========== */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAgMS4xMDUtLjg5NSAyLTIgMnMtMi0uODk1LTItMiAuODk1LTIgMi0yIDIgLjg5NSAyIDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 md:pt-28 md:pb-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full text-blue-200 text-sm font-medium mb-8 border border-blue-400/20">
              <Star className="w-4 h-4 text-yellow-400" />
              Plataforma #1 para corretores
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
              Encontre o{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                imovel perfeito
              </span>{' '}
              para voce
            </h1>

            <p className="text-lg sm:text-xl text-blue-100/80 mb-10 max-w-2xl leading-relaxed">
              Conecte-se diretamente com corretores especializados. Sem intermediarios,
              sem complicacao. Compre, venda ou alugue com seguranca e agilidade.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/imoveis"
                className="group bg-white text-slate-900 px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl font-semibold text-lg flex items-center justify-center gap-3"
              >
                <Search className="w-5 h-5" />
                Ver Imoveis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/register"
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl hover:bg-white/20 transition-all border border-white/20 font-semibold text-lg flex items-center justify-center gap-3"
              >
                <Users className="w-5 h-5" />
                Sou Corretor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== STATS SECTION ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-8 text-center border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
              <HomeIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-1">{totalImoveis}+</h3>
            <p className="text-gray-500 font-medium">Imoveis Disponiveis</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-8 text-center border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl mb-4">
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-1">{totalCorretores}+</h3>
            <p className="text-gray-500 font-medium">Corretores Parceiros</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-8 text-center border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-2xl mb-4">
              <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-1">98%</h3>
            <p className="text-gray-500 font-medium">Satisfacao dos Clientes</p>
          </div>
        </div>
      </section>

      {/* ========== BENEFITS SECTION ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Por que escolher a ImóvelPro?
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Uma plataforma completa que conecta compradores, locatarios e corretores de forma simples e eficiente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group p-8 rounded-2xl bg-gradient-to-b from-blue-50 to-white border border-blue-100 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Seguranca Total</h3>
            <p className="text-gray-500 leading-relaxed">
              Todos os corretores sao verificados e aprovados. Seus dados estao protegidos com criptografia.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-100 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Rapido e Facil</h3>
            <p className="text-gray-500 leading-relaxed">
              Encontre e entre em contato com corretores em minutos. Sem burocracia e sem complicacao.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-gradient-to-b from-amber-50 to-white border border-amber-100 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Star className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Imoveis Selecionados</h3>
            <p className="text-gray-500 leading-relaxed">
              Cada imovel e verificado para garantir qualidade. Fotos reais e informacoes detalhadas.
            </p>
          </div>
        </div>
      </section>

      {/* ========== FEATURED PROPERTIES ========== */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Imoveis em Destaque
              </h2>
              <p className="text-lg text-gray-500">
                As melhores oportunidades selecionadas para voce
              </p>
            </div>
            <Link
              href="/imoveis"
              className="group inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Ver todos
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {imoveis.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
                <HomeIcon className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-400 text-lg">
                Nenhum imovel disponivel no momento. Em breve teremos novidades!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {imoveis.map((imovel: any) => (
                <Link key={imovel.id} href={`/imovel/${imovel.id}`}>
                  <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {imovel.images && imovel.images.length > 0 ? (
                        <img
                          src={imovel.images[0]}
                          alt={imovel.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Building2 className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide shadow-lg ${
                            imovel.tipo === 'VENDA'
                              ? 'bg-blue-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {imovel.tipo === 'VENDA' ? 'Venda' : 'Aluguel'}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <p className="text-2xl font-bold text-white drop-shadow-lg">
                          R${' '}
                          {Number(imovel.valor).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {imovel.titulo}
                      </h3>

                      <div className="flex items-center gap-2 text-gray-500 mb-4">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm truncate">
                          {imovel.cidade}, {imovel.estado}
                        </span>
                      </div>

                      {/* Features */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pt-4 border-t border-gray-100">
                        {imovel.quartos && (
                          <span className="flex items-center gap-1.5">
                            <Bed className="w-4 h-4 text-gray-400" />
                            {imovel.quartos}
                          </span>
                        )}
                        {imovel.banheiros && (
                          <span className="flex items-center gap-1.5">
                            <Bath className="w-4 h-4 text-gray-400" />
                            {imovel.banheiros}
                          </span>
                        )}
                        {imovel.area && (
                          <span className="flex items-center gap-1.5">
                            <Maximize className="w-4 h-4 text-gray-400" />
                            {Number(imovel.area)}m2
                          </span>
                        )}
                      </div>

                      {/* Agent */}
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">
                              {imovel.corretor.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {imovel.corretor.user.name}
                          </span>
                        </div>
                        <span className="text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Detalhes
                          <ArrowRight className="w-4 h-4" />
                        </span>
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
                href="/imoveis"
                className="group inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                Ver Todos os Imoveis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Como funciona
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Em 3 passos simples voce encontra o imovel dos seus sonhos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6">
              <Search className="w-10 h-10 text-white" />
              <span className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Busque</h3>
            <p className="text-gray-500">
              Use nossos filtros avancados para encontrar imoveis por tipo, localizacao, preco e caracteristicas.
            </p>
          </div>

          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-2xl mb-6">
              <Building2 className="w-10 h-10 text-white" />
              <span className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Escolha</h3>
            <p className="text-gray-500">
              Compare opcoes, veja fotos detalhadas e informacoes completas de cada imovel.
            </p>
          </div>

          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-amber-600 rounded-2xl mb-6">
              <CheckCircle2 className="w-10 h-10 text-white" />
              <span className="absolute -top-2 -right-2 w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Conecte-se</h3>
            <p className="text-gray-500">
              Entre em contato direto com o corretor via WhatsApp ou telefone e agende sua visita.
            </p>
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION - FOR AGENTS ========== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-800" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAgMS4xMDUtLjg5NSAyLTIgMnMtMi0uODk1LTItMiAuODk1LTIgMi0yIDIgLjg5NSAyIDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Voce e um Corretor de Imoveis?
              </h2>
              <p className="text-xl text-blue-100/80 mb-8 leading-relaxed">
                Cadastre-se gratuitamente e tenha acesso a ferramentas profissionais para gerenciar seus imoveis,
                leads e muito mais.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-blue-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Pagina personalizada para seus imoveis</span>
                </li>
                <li className="flex items-center gap-3 text-blue-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Gestao de leads e clientes integrada</span>
                </li>
                <li className="flex items-center gap-3 text-blue-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Quadro Kanban e calendario de visitas</span>
                </li>
                <li className="flex items-center gap-3 text-blue-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Landing page profissional e compartilhavel</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="group inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl font-semibold text-lg"
              >
                <Users className="w-5 h-5" />
                Criar Conta Gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Publique Imoveis</p>
                      <p className="text-blue-200 text-sm">Cadastre com fotos, mapa e detalhes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/30 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Gerencie Leads</p>
                      <p className="text-blue-200 text-sm">CRM completo com pontuacao e tags</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/30 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Acompanhe Metricas</p>
                      <p className="text-blue-200 text-sm">Dashboard com analytics em tempo real</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
