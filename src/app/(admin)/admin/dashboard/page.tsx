import { getAllCorretores } from '@/server/actions/admin'
import { getAllImoveisAdmin } from '@/server/actions/admin'
import { getAllLeads } from '@/server/actions/leads'
import { Card } from '@/components/ui/Card'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const corretoresResult = await getAllCorretores()
  const imoveisResult = await getAllImoveisAdmin()
  const leadsResult = await getAllLeads()

  const corretores = corretoresResult.success ? corretoresResult.corretores : []
  const imoveis = imoveisResult.success ? imoveisResult.imoveis : []
  const leads = leadsResult.success ? leadsResult.leads : []

  const corretoresAtivos = corretores?.filter((c: any) => c.user.active).length || 0
  const corretoresPendentes = corretores?.filter((c: any) => !c.approved).length || 0

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Admin</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-500">Total de Corretores</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {corretores?.length || 0}
          </p>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-500">Corretores Ativos</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {corretoresAtivos}
          </p>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-500">Pendentes Aprovação</h3>
          <p className="mt-2 text-3xl font-semibold text-yellow-600">
            {corretoresPendentes}
          </p>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-500">Total de Imóveis</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">
            {imoveis?.length || 0}
          </p>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Últimos Leads</h2>
          {leads && leads.length > 0 ? (
            <div className="space-y-4">
              {leads.slice(0, 5).map((lead: any) => (
                <div key={lead.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  <p className="text-sm text-gray-600">{lead.email}</p>
                  <p className="text-sm text-blue-600">
                    {lead.imovel.titulo}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Corretor: {lead.corretor.user.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum lead ainda</p>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Últimos Imóveis</h2>
          {imoveis && imoveis.length > 0 ? (
            <div className="space-y-4">
              {imoveis.slice(0, 5).map((imovel: any) => (
                <div key={imovel.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <p className="font-medium text-gray-900">{imovel.titulo}</p>
                  <p className="text-sm text-gray-600">
                    R$ {Number(imovel.valor).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Corretor: {imovel.corretor.user.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum imóvel ainda</p>
          )}
        </Card>
      </div>
    </div>
  )
}
