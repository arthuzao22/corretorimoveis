import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { getKanbanBoard, getKanbanPermissions } from '@/server/actions/kanban'
import { KanbanEditorClient } from './KanbanEditorClient'
import { Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function KanbanEditorPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'CORRETOR') {
    redirect('/login')
  }

  // Check permissions
  const permissionsResult = await getKanbanPermissions()
  
  if (!permissionsResult.success || !permissionsResult.permissions?.canEditColumns) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-yellow-900">Acesso Restrito</h2>
          </div>
          <p className="text-yellow-800">
            Você não tem permissão para editar a estrutura do Kanban. 
            Entre em contato com um administrador para solicitar acesso.
          </p>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900">Editor do Kanban</h1>
          <p className="text-gray-600 mt-1">
            Configure as colunas do seu pipeline de vendas
          </p>
        </div>
      </div>

      {/* Editor */}
      <KanbanEditorClient initialBoard={result.board} />
    </div>
  )
}
