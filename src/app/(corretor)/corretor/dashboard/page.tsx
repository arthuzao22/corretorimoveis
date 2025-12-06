import { getMyImoveis } from '@/server/actions/imoveis'
import { getMyLeads } from '@/server/actions/leads'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/MetricCard'
import { LeadTable } from '@/components/ui/LeadTable'
import { Building2, Home, TrendingUp, Users } from 'lucide-react'

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bem-vindo ao seu painel de controle</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Imóveis"
          value={imoveis?.length || 0}
          icon={Building2}
          color="blue"
        />
        <MetricCard
          title="Imóveis Ativos"
          value={imoveisAtivos}
          icon={Home}
          color="green"
        />
        <MetricCard
          title="Imóveis Inativos"
          value={imoveisInativos}
          icon={TrendingUp}
          color="orange"
        />
        <MetricCard
          title="Total de Leads"
          value={totalLeads}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Leads Table */}
      <Card>
        <h2 className="text-xl font-semibold mb-6 text-gray-900">Últimos Leads</h2>
        <LeadTable leads={leads?.slice(0, 5) || []} />
      </Card>
    </div>
  )
}
