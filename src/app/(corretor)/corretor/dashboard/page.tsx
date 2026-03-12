import { getDashboardMetrics } from '@/server/actions/dashboard'
import { getMyLeads } from '@/server/actions/leads'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/MetricCard'
import { LeadTable } from '@/components/ui/LeadTable'
import { LeadsPipelineChart } from '@/components/charts/LeadsPipelineChart'
import { TopPropertiesWidget } from '@/components/dashboard/TopPropertiesWidget'
import { UpcomingEventsWidget } from '@/components/dashboard/UpcomingEventsWidget'
import { PendingTasksWidget } from '@/components/dashboard/PendingTasksWidget'
import { Home, Users, Eye, Target, Building2, Key, BarChart3, ArrowRight } from 'lucide-react'
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/skeletons'
import Link from 'next/link'

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Visao geral do seu negocio</p>
        </div>
        <Link 
          href="/corretor/kanban"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm"
        >
          <BarChart3 className="w-4 h-4" />
          Ver Kanban
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Grid with Comparisons */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <MetricCard
          title="Imoveis Ativos"
          value={metrics.imoveisAtivos}
          icon={Home}
          color="indigo"
          trend={{
            value: calculateTrend(metrics.imoveisAtivos, metrics.imoveisAtivosPrevMonth),
            isPositive: calculateIsPositive(metrics.imoveisAtivos, metrics.imoveisAtivosPrevMonth)
          }}
        />
        <MetricCard
          title="Leads Este Mes"
          value={metrics.totalLeads}
          icon={Users}
          color="teal"
          trend={{
            value: calculateTrend(metrics.totalLeads, metrics.totalLeadsPrevMonth),
            isPositive: calculateIsPositive(metrics.totalLeads, metrics.totalLeadsPrevMonth)
          }}
        />
        <MetricCard
          title="Taxa de Conversao"
          value={`${metrics.taxaConversao.toFixed(1)}%`}
          icon={Target}
          color="green"
          trend={{
            value: calculateTrend(metrics.taxaConversao, metrics.taxaConversaoPrevMonth),
            isPositive: calculateIsPositive(metrics.taxaConversao, metrics.taxaConversaoPrevMonth)
          }}
        />
        <MetricCard
          title="Visualizacoes"
          value={metrics.totalViews}
          icon={Eye}
          color="amber"
          trend={{
            value: calculateTrend(metrics.totalViews, metrics.totalViewsPrevMonth),
            isPositive: calculateIsPositive(metrics.totalViews, metrics.totalViewsPrevMonth)
          }}
        />
      </div>

      {/* Metrics by Type (VENDA/ALUGUEL) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Vendas */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Vendas</h3>
              <p className="text-xs text-slate-400">Imoveis para venda</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-slate-50">
              <p className="text-2xl font-bold text-slate-800">{metrics.byTipo.venda.imoveis}</p>
              <p className="text-xs text-slate-500 mt-1">Imoveis</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50">
              <p className="text-2xl font-bold text-slate-800">{metrics.byTipo.venda.leads}</p>
              <p className="text-xs text-slate-500 mt-1">Leads</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50">
              <p className="text-2xl font-bold text-slate-800">{metrics.byTipo.venda.views}</p>
              <p className="text-xs text-slate-500 mt-1">Views</p>
            </div>
          </div>
        </div>

        {/* Alugueis */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Alugueis</h3>
              <p className="text-xs text-slate-400">Imoveis para alugar</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-slate-50">
              <p className="text-2xl font-bold text-slate-800">{metrics.byTipo.aluguel.imoveis}</p>
              <p className="text-xs text-slate-500 mt-1">Imoveis</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50">
              <p className="text-2xl font-bold text-slate-800">{metrics.byTipo.aluguel.leads}</p>
              <p className="text-xs text-slate-500 mt-1">Leads</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50">
              <p className="text-2xl font-bold text-slate-800">{metrics.byTipo.aluguel.views}</p>
              <p className="text-xs text-slate-500 mt-1">Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Pipeline Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-800">Pipeline de Leads</h2>
            <Link 
              href="/corretor/kanban"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              Ver Kanban
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <LeadsPipelineChart data={metrics.pipeline} />
        </div>

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
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">Ultimos Leads</h2>
          {leads && leads.length > 5 && (
            <Link 
              href="/corretor/leads" 
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
        <LeadTable leads={leads ? leads.slice(0, 5) : []} />
      </div>
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
