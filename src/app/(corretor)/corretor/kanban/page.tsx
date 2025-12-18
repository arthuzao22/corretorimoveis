import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { getKanbanBoard } from '@/server/actions/kanban'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { LayoutGrid } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function KanbanPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'CORRETOR') {
    redirect('/login')
  }

  const result = await getKanbanBoard()

  if (!result.success || !result.board) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{result.error || 'Erro ao carregar board'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kanban - Pipeline de Vendas</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus leads visualmente com drag & drop
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/corretor/kanban/analytics"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
