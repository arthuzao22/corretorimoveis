'use client'

import { Card } from '@/components/ui/Card'
import { AlertCircle, Calendar } from 'lucide-react'
import Link from 'next/link'

interface PendingTasksWidgetProps {
  leadsNaoContatados: number
  eventosProximos: number
}

export function PendingTasksWidget({ leadsNaoContatados, eventosProximos }: PendingTasksWidgetProps) {
  const totalTasks = leadsNaoContatados + eventosProximos

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Tarefas Pendentes</h2>
      
      {totalTasks === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Tudo em dia!</p>
          <p className="text-sm text-gray-500 mt-1">Não há tarefas pendentes no momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leadsNaoContatados > 0 && (
            <Link
              href="/corretor/leads"
              className="flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-700" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Leads sem contato</p>
                  <p className="text-sm text-gray-600">Entrar em contato o quanto antes</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-orange-700">{leadsNaoContatados}</span>
            </Link>
          )}
          
          {eventosProximos > 0 && (
            <Link
              href="/corretor/calendario"
              className="flex items-center justify-between p-4 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Eventos próximos</p>
                  <p className="text-sm text-gray-600">Nos próximos 7 dias</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-700">{eventosProximos}</span>
            </Link>
          )}
        </div>
      )}
    </Card>
  )
}
