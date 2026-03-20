import { getAllLandings } from '@/server/actions/landing'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { Eye, Edit, Layers } from 'lucide-react'

export default async function AdminLandingsPage() {
  const result = await getAllLandings()

  if (!result.success || !result.corretores) {
    return (
      <div className="p-8">
        <Card className="bg-red-50 border-red-200 rounded-2xl">
          <p className="text-red-700 text-sm font-medium">Erro ao carregar landings</p>
        </Card>
      </div>
    )
  }

  const { corretores } = result

  return (
    <div className="p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Gerenciar Landing Pages
        </h1>
        <p className="text-slate-500 text-sm sm:text-base">
          Crie e personalize as landing pages dos corretores
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {corretores.map((corretor) => (
          <Card key={corretor.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {corretor.user.name}
                  </h3>
                  <p className="text-sm text-slate-500">{corretor.user.email}</p>
                  {corretor.cidade && (
                    <p className="text-sm text-slate-600 mt-1">{corretor.cidade}</p>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  corretor.landingAtiva 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {corretor.landingAtiva ? 'Ativa' : 'Pausada'}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                <Layers className="w-4 h-4" />
                <span>
                  {corretor._count.landingBlocos} {corretor._count.landingBlocos === 1 ? 'bloco' : 'blocos'}
                </span>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/admin/landings/${corretor.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Link>
                <Link
                  href={`/lp/${corretor.slug}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Ver
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {corretores.length === 0 && (
        <Card className="p-12 text-center rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500">Nenhum corretor cadastrado ainda</p>
        </Card>
      )}
    </div>
  )
}
