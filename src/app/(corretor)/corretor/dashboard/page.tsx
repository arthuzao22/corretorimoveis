import { getMyImoveis } from '@/server/actions/imoveis'
import { getMyLeads } from '@/server/actions/leads'
import { Card } from '@/components/ui/Card'

export const dynamic = 'force-dynamic'

export default async function CorretorDashboard() {
  const imoveisResult = await getMyImoveis()
  const leadsResult = await getMyLeads()

  const imoveis = imoveisResult.success ? imoveisResult.imoveis : []
  const leads = leadsResult.success ? leadsResult.leads : []

  const imoveisAtivos = imoveis?.filter((i: any) => i.status === 'ATIVO').length || 0
  const imoveisInativos = imoveis?.filter((i: any) => i.status === 'INATIVO').length || 0
  const totalLeads = leads?.length || 0

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-500">Total de Imóveis</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {imoveis?.length || 0}
          </p>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-500">Imóveis Ativos</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {imoveisAtivos}
          </p>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-500">Imóveis Inativos</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-600">
            {imoveisInativos}
          </p>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-500">Total de Leads</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">
            {totalLeads}
          </p>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Últimos Leads</h2>
          {leads && leads.length > 0 ? (
            <div className="space-y-4">
              {leads.slice(0, 5).map((lead: any) => (
                <div key={lead.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-600">{lead.email}</p>
                      <p className="text-sm text-gray-600">{lead.phone}</p>
                      <p className="text-sm text-blue-600 mt-1">
                        {lead.imovel.titulo}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum lead ainda</p>
          )}
        </Card>
      </div>
    </div>
  )
}
