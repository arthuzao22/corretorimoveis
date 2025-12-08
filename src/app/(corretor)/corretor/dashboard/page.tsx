import { getMyImoveis } from '@/server/actions/imoveis'
import { getMyLeads } from '@/server/actions/leads'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/MetricCard'
import { LeadTable } from '@/components/ui/LeadTable'
import { LeadsPipelineChart } from '@/components/charts/LeadsPipelineChart'
import { Building2, Home, TrendingUp, Users, DollarSign, Eye } from 'lucide-react'
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/skeletons'

export const dynamic = 'force-dynamic'

async function DashboardContent() {
  const imoveisResult = await getMyImoveis()
  const leadsResult = await getMyLeads()

  const imoveis = imoveisResult.success ? imoveisResult.imoveis : []
  const leads = leadsResult.success ? leadsResult.leads : []

  const imoveisAtivos = imoveis?.filter((i: any) => i.status === 'ATIVO').length || 0
  const imoveisVendidos = imoveis?.filter((i: any) => i.status === 'VENDIDO').length || 0
  const totalLeads = leads?.length || 0
  const totalViews = imoveis?.reduce((sum: number, i: any) => sum + (i.views || 0), 0) || 0

  // Pipeline de leads
  const leadsNovos = leads?.filter((l: any) => l.status === 'NOVO').length || 0
  const leadsContatados = leads?.filter((l: any) => l.status === 'CONTATADO').length || 0
  const leadsQualificados = leads?.filter((l: any) => l.status === 'QUALIFICADO').length || 0
  const leadsNegociacao = leads?.filter((l: any) => l.status === 'NEGOCIACAO').length || 0
  const leadsConvertidos = leads?.filter((l: any) => l.status === 'CONVERTIDO').length || 0
  const leadsPerdidos = leads?.filter((l: any) => l.status === 'PERDIDO').length || 0

  const pipelineData = {
    novos: leadsNovos,
    contatados: leadsContatados,
    qualificados: leadsQualificados,
    negociacao: leadsNegociacao,
    convertidos: leadsConvertidos,
    perdidos: leadsPerdidos,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bem-vindo ao seu painel de controle</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Imóveis Ativos"
          value={imoveisAtivos}
          icon={Home}
          color="blue"
        />
        <MetricCard
          title="Total de Leads"
          value={totalLeads}
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="Imóveis Vendidos"
          value={imoveisVendidos}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Visualizações"
          value={totalViews}
          icon={Eye}
          color="orange"
        />
      </div>

      {/* Pipeline Chart */}
      {totalLeads > 0 && (
        <Card>
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Pipeline de Leads</h2>
          <LeadsPipelineChart data={pipelineData} />
        </Card>
      )}

      {/* Leads Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Últimos Leads</h2>
          {totalLeads > 5 && (
            <a href="/corretor/leads" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver todos →
            </a>
          )}
        </div>
        <LeadTable leads={leads?.slice(0, 5) || []} />
      </Card>
    </div>
  )
}

export default function CorretorDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
