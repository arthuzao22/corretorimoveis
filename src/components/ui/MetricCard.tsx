import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: 'blue' | 'green' | 'indigo' | 'amber' | 'teal' | 'slate'
  trend?: {
    value: string
    isPositive: boolean
  }
  subtitle?: string
}

export function MetricCard({ title, value, icon: Icon, color = 'indigo', trend, subtitle }: MetricCardProps) {
  const colorConfig = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-700',
      border: 'border-blue-100',
      gradient: 'from-blue-500 to-blue-600'
    },
    green: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    indigo: {
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
      text: 'text-indigo-700',
      border: 'border-indigo-100',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      text: 'text-amber-700',
      border: 'border-amber-100',
      gradient: 'from-amber-500 to-amber-600'
    },
    teal: {
      bg: 'bg-teal-50',
      icon: 'text-teal-600',
      text: 'text-teal-700',
      border: 'border-teal-100',
      gradient: 'from-teal-500 to-teal-600'
    },
    slate: {
      bg: 'bg-slate-50',
      icon: 'text-slate-600',
      text: 'text-slate-700',
      border: 'border-slate-100',
      gradient: 'from-slate-500 to-slate-600'
    }
  }

  const colors = colorConfig[color]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md hover:border-slate-200 transition-all duration-300 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 mb-1 truncate">{title}</p>
          <p className={`text-3xl font-bold text-slate-800 tracking-tight`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1.5 mt-3 text-sm font-medium ${
              trend.isPositive ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border group-hover:scale-105 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </div>
  )
}
