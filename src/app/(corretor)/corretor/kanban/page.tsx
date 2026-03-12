import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { getKanbanBoard, getKanbanPermissions } from '@/server/actions/kanban'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { LayoutGrid, Settings } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function KanbanPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'CORRETOR') {
    redirect('/login')
  }

  const result = await getKanbanBoard()
  const permissionsResult = await getKanbanPermissions()

  if (!result.success || !result.board) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{result.error || 'Erro ao carregar board'}</p>
        </div>
      </div>
    )
  }

  const canEditColumns = permissionsResult.success && permissionsResult.permissions?.canEditColumns

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Pipeline de Vendas</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Arraste e solte para gerenciar seus leads
          </p>
        </div>
        <div className="flex gap-2">
          {canEditColumns && (
            <Link
              href="/corretor/kanban/editor"
              className="px-4 py-2.5 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium border border-slate-200 shadow-sm"
            >
              <Settings className="w-4 h-4" />
              Configurar
            </Link>
          )}
          <Link
            href="/corretor/kanban/analytics"
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <LayoutGrid className="w-4 h-4" />
            Analytics
          </Link>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard initialBoard={result.board} />
    </div>
  )
}
