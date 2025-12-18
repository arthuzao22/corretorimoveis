import { Calendar, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EventCardProps {
  tipo: string
  dataHora: Date | string
  imovelTitulo?: string
  observacao?: string
  completed?: boolean
  onClick?: () => void
  className?: string
}

export function EventCard({
  tipo,
  dataHora,
  imovelTitulo,
  observacao,
  completed,
  onClick,
  className = '',
}: EventCardProps) {
  const date = typeof dataHora === 'string' ? new Date(dataHora) : dataHora

  const getTypeConfig = () => {
    switch (tipo) {
      case 'VISITA':
        return {
          label: 'Visita',
          color: 'bg-blue-500',
          lightColor: 'bg-blue-50 border-blue-200 text-blue-700',
        }
      case 'ACOMPANHAMENTO':
        return {
          label: 'Follow-up',
          color: 'bg-yellow-500',
          lightColor: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        }
      case 'REUNIAO':
        return {
          label: 'Reunião',
          color: 'bg-green-500',
          lightColor: 'bg-green-50 border-green-200 text-green-700',
        }
      case 'URGENTE':
        return {
          label: 'Urgente',
          color: 'bg-red-500',
          lightColor: 'bg-red-50 border-red-200 text-red-700',
        }
      default:
        return {
          label: tipo,
          color: 'bg-gray-500',
          lightColor: 'bg-gray-50 border-gray-200 text-gray-700',
        }
    }
  }

  const config = getTypeConfig()

  return (
    <div
      onClick={onClick}
      className={`border rounded-lg p-3 hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      } ${completed ? 'opacity-60' : ''} ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-1 h-full ${config.color} rounded-full`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${config.lightColor}`}>
              {config.label}
            </span>
            {completed && (
              <span className="text-xs text-green-600 font-medium">✓ Concluído</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(date, "dd 'de' MMMM", { locale: ptBR })}</span>
            <Clock className="w-3.5 h-3.5 ml-2" />
            <span>{format(date, 'HH:mm')}</span>
          </div>

          {imovelTitulo && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{imovelTitulo}</span>
            </div>
          )}

          {observacao && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{observacao}</p>
          )}
        </div>
      </div>
    </div>
  )
}
