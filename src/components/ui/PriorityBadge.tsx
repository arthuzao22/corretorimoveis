import { LeadPriority } from '@prisma/client'
import { AlertCircle, ArrowUp, Minus } from 'lucide-react'

interface PriorityBadgeProps {
  priority: LeadPriority | string
  className?: string
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  const getConfig = () => {
    switch (priority) {
      case 'URGENTE':
        return {
          label: 'Urgente',
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: AlertCircle,
        }
      case 'ALTA':
        return {
          label: 'Alta',
          color: 'bg-orange-100 text-orange-700 border-orange-200',
          icon: ArrowUp,
        }
      case 'MEDIA':
        return {
          label: 'Média',
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: Minus,
        }
      case 'BAIXA':
      default:
        return {
          label: 'Baixa',
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: Minus,
        }
    }
  }

  const config = getConfig()
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.color} ${className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}
