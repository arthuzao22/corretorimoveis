import { getAllLandings } from '@/server/actions/landing'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { Eye, Edit, Layers } from 'lucide-react'

export default async function AdminLandingsPage() {
  const result = await getAllLandings()

  if (!result.success || !result.corretores) {
    return (
      <div className="p-8">
        <Card className="bg-red-50 border-red-200">
          <p className="text-red-600">Erro ao carregar landings</p>
        </Card>
      </div>
    )
  }

  const { corretores } = result

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gerenciar Landing Pages
        </h1>
        <p className="text-gray-600">
          Crie e personalize as landing pages dos corretores
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {corretores.map((corretor) => (
          <Card key={corretor.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {corretor.user.name}
                  </h3>
                  <p className="text-sm text-gray-500">{corretor.user.email}</p>
                  {corretor.cidade && (
                    <p className="text-sm text-gray-600 mt-1">{corretor.cidade}</p>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  corretor.landingAtiva 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {corretor.landingAtiva ? 'Ativa' : 'Pausada'}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Layers className="w-4 h-4" />
                <span>
                  {corretor._count.landingBlocos} {corretor._count.landingBlocos === 1 ? 'bloco' : 'blocos'}
                </span>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/admin/landings/${corretor.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Link>
                <Link
                  href={`/lp/${corretor.slug}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
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
        <Card className="p-12 text-center">
          <p className="text-gray-500">Nenhum corretor cadastrado ainda</p>
        </Card>
      )}
    </div>
  )
}
