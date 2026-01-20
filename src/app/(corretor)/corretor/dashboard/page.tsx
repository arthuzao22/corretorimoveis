import { getDashboardMetrics } from '@/server/actions/dashboard'
import { getMyLeads } from '@/server/actions/leads'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/MetricCard'
import { LeadTable } from '@/components/ui/LeadTable'
import { LeadsPipelineChart } from '@/components/charts/LeadsPipelineChart'
import { TopPropertiesWidget } from '@/components/dashboard/TopPropertiesWidget'
import { UpcomingEventsWidget } from '@/components/dashboard/UpcomingEventsWidget'
import { PendingTasksWidget } from '@/components/dashboard/PendingTasksWidget'
import { Home, Users, TrendingUp, Eye, Target } from 'lucide-react'
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/skeletons'

export const dynamic = 'force-dynamic'

async function DashboardContent() {
  const metricsResult = await getDashboardMetrics()
  const leadsResult = await getMyLeads()

  if (!metricsResult.success || !metricsResult.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erro ao carregar dashboard: {metricsResult.error}</p>
      </div>
    )
  }

  const metrics = metricsResult.data
  const leads = leadsResult.success ? leadsResult.leads : []

  // Calculate trend percentages
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%'
    const diff = current - previous
    const percentage = Math.abs((diff / previous) * 100).toFixed(0)
    return diff >= 0 ? `+${percentage}% vs mês anterior` : `-${percentage}% vs mês anterior`
  }

  const calculateIsPositive = (current: number, previous: number) => {
    return current >= previous
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bem-vindo ao seu painel de controle</p>
      </div>

      {/* Metrics Grid with Comparisons */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Imóveis Ativos"
          value={metrics.imoveisAtivos}
          icon={Home}
          color="blue"
          trend={{
            value: calculateTrend(metrics.imoveisAtivos, metrics.imoveisAtivosPrevMonth),
            isPositive: calculateIsPositive(metrics.imoveisAtivos, metrics.imoveisAtivosPrevMonth)
          }}
        />
        <MetricCard
          title="Leads Este Mês"
          value={metrics.totalLeads}
          icon={Users}
          color="purple"
          trend={{
            value: calculateTrend(metrics.totalLeads, metrics.totalLeadsPrevMonth),
            isPositive: calculateIsPositive(metrics.totalLeads, metrics.totalLeadsPrevMonth)
          }}
        />
        <MetricCard
          title="Taxa de Conversão"
          value={`${metrics.taxaConversao.toFixed(1)}%`}
          icon={Target}
          color="green"
          trend={{
            value: calculateTrend(metrics.taxaConversao, metrics.taxaConversaoPrevMonth),
            isPositive: calculateIsPositive(metrics.taxaConversao, metrics.taxaConversaoPrevMonth)
          }}
        />
        <MetricCard
          title="Visualizações"
          value={metrics.totalViews}
          icon={Eye}
          color="orange"
          trend={{
            value: calculateTrend(metrics.totalViews, metrics.totalViewsPrevMonth),
            isPositive: calculateIsPositive(metrics.totalViews, metrics.totalViewsPrevMonth)
          }}
        />
      </div>

      {/* Two Column Layout for Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Chart */}
        <Card>
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Pipeline de Leads</h2>
          <LeadsPipelineChart data={metrics.pipeline} />
        </Card>

        {/* Top Properties */}
        <TopPropertiesWidget properties={metrics.topImoveis} />
      </div>

      {/* Two Column Layout for Events and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <UpcomingEventsWidget events={metrics.upcomingEvents} />

        {/* Pending Tasks */}
        <PendingTasksWidget
          leadsNaoContatados={metrics.pendingTasks.leadsNaoContatados}
          eventosProximos={metrics.pendingTasks.eventosProximos}
        />
      </div>

      {/* Leads Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Últimos Leads</h2>
          {leads && leads.length > 5 && (
            <a href="/corretor/leads" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver todos →
            </a>
          )}
        </div>
        <LeadTable leads={leads ? leads.slice(0, 5) : []} />
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
