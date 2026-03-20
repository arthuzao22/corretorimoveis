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
      <h2 className="text-lg font-semibold mb-5 text-slate-800">Tarefas Pendentes</h2>
      
      {totalTasks === 0 ? (
        <div className="text-center py-8">
          <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-slate-700 font-medium">Tudo em dia!</p>
          <p className="text-sm text-slate-500 mt-1">Nao ha tarefas pendentes no momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leadsNaoContatados > 0 && (
            <Link
              href="/corretor/leads"
              className="flex items-center justify-between p-4 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Leads sem contato</p>
                  <p className="text-sm text-slate-600">Entrar em contato o quanto antes</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-amber-600">{leadsNaoContatados}</span>
            </Link>
          )}
          
          {eventosProximos > 0 && (
            <Link
              href="/corretor/calendario"
              className="flex items-center justify-between p-4 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Eventos proximos</p>
                  <p className="text-sm text-slate-600">Nos proximos 7 dias</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-indigo-600">{eventosProximos}</span>
            </Link>
          )}
        </div>
      )}
    </Card>
  )
}
