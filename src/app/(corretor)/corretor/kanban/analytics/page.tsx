import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { getKanbanMetrics } from '@/server/actions/kanban-analytics'
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function KanbanAnalyticsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'CORRETOR') {
    redirect('/login')
  }

  const result = await getKanbanMetrics()

  if (!result.success || !result.metrics) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{result.error || 'Erro ao carregar métricas'}</p>
        </div>
      </div>
    )
  }

  const { metrics } = result

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics do Kanban</h1>
        <p className="text-gray-600 mt-1">
          Métricas e insights do seu pipeline de vendas
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Leads</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.conversionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Fechados</p>
              <p className="text-2xl font-bold text-green-600">{metrics.closedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Perdidos</p>
              <p className="text-2xl font-bold text-red-600">{metrics.lostCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leads per Column */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads por Coluna</h2>
        <div className="space-y-3">
          {metrics.leadsPerColumn.map(column => (
            <div key={column.columnId} className="flex items-center gap-4">
              <div
                className="w-1 h-12 rounded"
                style={{ backgroundColor: column.color || '#6B7280' }}
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{column.columnName}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${metrics.totalLeads > 0 ? (column.count / metrics.totalLeads) * 100 : 0}%`,
                      backgroundColor: column.color || '#6B7280'
                    }}
                  />
                </div>
              </div>
              <span className="font-semibold text-gray-900">{column.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Average Time per Column */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Tempo Médio por Coluna
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.avgTimePerColumn.map(column => (
            <div key={column.columnId} className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{column.columnName}</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {column.avgDays} dias
              </p>
              <p className="text-sm text-gray-500">{column.avgHours}h em média</p>
            </div>
          ))}
        </div>
      </div>

      {/* Closed vs Lost Ratio */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fechados vs Perdidos</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex gap-2 h-8 rounded overflow-hidden">
              <div
                className="bg-green-500 flex items-center justify-center text-white text-sm font-medium"
                style={{ width: `${metrics.closedVsLostRatio}%` }}
              >
                {metrics.closedVsLostRatio > 20 && `${metrics.closedVsLostRatio.toFixed(0)}%`}
              </div>
              <div
                className="bg-red-500 flex items-center justify-center text-white text-sm font-medium"
                style={{ width: `${100 - metrics.closedVsLostRatio}%` }}
              >
                {(100 - metrics.closedVsLostRatio) > 20 && `${(100 - metrics.closedVsLostRatio).toFixed(0)}%`}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-green-600 font-medium">
                Fechados: {metrics.closedCount}
              </span>
              <span className="text-red-600 font-medium">
                Perdidos: {metrics.lostCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
