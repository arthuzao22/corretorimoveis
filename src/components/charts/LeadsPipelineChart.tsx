'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface PipelineColumn {
  id: string
  name: string
  color: string | null
  count: number
  order: number
}

interface LeadsPipelineChartProps {
  data: PipelineColumn[]
}

// Default color palette for columns without custom colors
const defaultColors = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#10B981', // emerald
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#EF4444', // red
  '#84CC16', // lime
]

export function LeadsPipelineChart({ data }: LeadsPipelineChartProps) {
  // Sort by order and transform data for chart
  const chartData = [...data]
    .sort((a, b) => a.order - b.order)
    .map((column, index) => ({
      name: column.name,
      value: column.count,
      color: column.color || defaultColors[index % defaultColors.length],
    }))

  // Calculate total leads
  const totalLeads = chartData.reduce((sum, item) => sum + item.value, 0)

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
        <p className="text-sm">Nenhuma coluna no Kanban</p>
        <p className="text-xs text-gray-400 mt-1">Configure seu Kanban para ver o pipeline</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="flex flex-wrap gap-3">
        {chartData.map((item) => (
          <div 
            key={item.name}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${item.color}15`,
              color: item.color,
              border: `1px solid ${item.color}30`
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.name}</span>
            <span className="font-bold">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis 
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFF', 
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.12)',
              padding: '12px 16px'
            }}
            formatter={(value: number, name: string) => [
              <span key="value" className="font-bold">{value} leads</span>,
              <span key="name" className="text-gray-500">{name}</span>
            ]}
            labelFormatter={(label) => <span className="font-semibold text-gray-800">{label}</span>}
          />
          <Bar 
            dataKey="value" 
            radius={[6, 6, 0, 0]}
            maxBarSize={60}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                className="transition-opacity hover:opacity-80"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Total indicator */}
      <div className="text-center pt-2 border-t border-gray-100">
        <span className="text-sm text-gray-500">Total no pipeline: </span>
        <span className="font-bold text-gray-800">{totalLeads} leads</span>
      </div>
    </div>
  )
}
