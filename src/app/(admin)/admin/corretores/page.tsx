'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getAllCorretores, approveCorretor, toggleUserActive } from '@/server/actions/admin'
import { updateKanbanPermissions } from '@/server/actions/kanban'
import { Settings } from 'lucide-react'

type Corretor = {
  id: string
  slug: string
  approved: boolean
  user: {
    id: string
    name: string
    email: string
    active: boolean
    createdAt: Date
    kanbanPermission: {
      canEditBoard: boolean
      canEditColumns: boolean
    } | null
  }
  _count: {
    imoveis: number
    leads: number
  }
}

export default function CorretoresPage() {
  const [corretores, setCorretores] = useState<Corretor[]>([])
  const [loading, setLoading] = useState(true)
  const [savingPermissions, setSavingPermissions] = useState<string | null>(null)

  const loadCorretores = async () => {
    const result = await getAllCorretores()
    if (result.success && result.corretores) {
      setCorretores(result.corretores as any)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadCorretores()
  }, [])

  const handleApprove = async (corretorId: string) => {
    const result = await approveCorretor(corretorId)
    if (result.success) {
      loadCorretores()
    } else {
      alert(result.error)
    }
  }

  const handleToggleActive = async (userId: string) => {
    const result = await toggleUserActive(userId)
    if (result.success) {
      loadCorretores()
    } else {
      alert(result.error)
    }
  }

  const handleToggleKanbanPermission = async (userId: string, type: 'canEditColumns') => {
    setSavingPermissions(userId)
    
    const corretor = corretores.find(c => c.user.id === userId)
    const currentValue = corretor?.user.kanbanPermission?.[type] || false
    
    const result = await updateKanbanPermissions({
      userId,
      [type]: !currentValue
    })

    if (result.success) {
      loadCorretores()
    } else {
      alert(result.error)
    }
    
    setSavingPermissions(null)
  }

  if (loading) {
    return <div className="text-center py-10 text-slate-500">Carregando...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Gerenciar Corretores</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Controle de aprovação, ativação e permissões do Kanban por corretor.</p>
      </div>

      {corretores.length === 0 ? (
        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-center text-slate-500 py-8">
            Nenhum corretor cadastrado ainda.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {corretores.map((corretor) => (
            <Card key={corretor.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
              <div className="flex flex-col gap-4">
                {/* Main Info */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {corretor.user.name}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <p>
                        <span className="font-medium">Email:</span> {corretor.user.email}
                      </p>
                      <p>
                        <span className="font-medium">Slug:</span> {corretor.slug}
                      </p>
                      <p>
                        <span className="font-medium">Imóveis:</span> {corretor._count.imoveis}
                      </p>
                      <p>
                        <span className="font-medium">Leads:</span> {corretor._count.leads}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{' '}
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium border ${
                            corretor.user.active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {corretor.user.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Aprovado:</span>{' '}
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium border ${
                            corretor.approved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {corretor.approved ? 'Sim' : 'Pendente'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!corretor.approved && (
                      <Button
                        onClick={() => handleApprove(corretor.id)}
                        className="whitespace-nowrap bg-slate-900 hover:bg-slate-800 rounded-xl"
                      >
                        Aprovar
                      </Button>
                    )}
                    <Button
                      variant={corretor.user.active ? 'danger' : 'secondary'}
                      onClick={() => handleToggleActive(corretor.user.id)}
                      className="whitespace-nowrap"
                    >
                      {corretor.user.active ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </div>

                {/* Kanban Permissions */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-semibold text-slate-900">Permissões do Kanban</h4>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={corretor.user.kanbanPermission?.canEditColumns || false}
                        onChange={() => handleToggleKanbanPermission(corretor.user.id, 'canEditColumns')}
                        disabled={savingPermissions === corretor.user.id}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">
                        Pode editar estrutura do Kanban
                        {savingPermissions === corretor.user.id && (
                          <span className="ml-2 text-xs text-slate-500">(salvando...)</span>
                        )}
                      </span>
                    </label>
                  </div>
                  
                  <p className="text-xs text-slate-500 mt-2">
                    Corretores com esta permissão podem criar, editar e excluir colunas do Kanban.
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
