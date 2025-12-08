'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface LeadsPipelineData {
  novos: number
  contatados: number
  qualificados: number
  negociacao: number
  convertidos: number
  perdidos: number
}

export function LeadsPipelineChart({ data }: { data: LeadsPipelineData }) {
  const chartData = [
    { name: 'Novos', value: data.novos, color: '#3B82F6' },
    { name: 'Contatados', value: data.contatados, color: '#8B5CF6' },
    { name: 'Qualificados', value: data.qualificados, color: '#F59E0B' },
    { name: 'Negociação', value: data.negociacao, color: '#10B981' },
    { name: 'Convertidos', value: data.convertidos, color: '#059669' },
    { name: 'Perdidos', value: data.perdidos, color: '#EF4444' },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#6B7280', fontSize: 12 }}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis 
          tick={{ fill: '#6B7280', fontSize: 12 }}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#FFF', 
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
