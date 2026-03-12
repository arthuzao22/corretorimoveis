'use client'

import { useState, useEffect } from 'react'
import { getAllCorretores, promoteUserToAdmin } from '@/server/actions/admin'
import { Button } from '@/components/ui/Button'
import { Shield, Loader2 } from 'lucide-react'

type User = {
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [processingUserId, setProcessingUserId] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const result = await getAllCorretores()
    if (result.success && result.corretores) {
      setUsers(result.corretores)
    }
    setLoading(false)
  }

  const handlePromote = async (userId: string) => {
    if (!confirm('Tem certeza que deseja promover este usuário a administrador?')) {
      return
    }

    const reason = prompt('Motivo da promoção (para auditoria):')

    setProcessingUserId(userId)
    const result = await promoteUserToAdmin(userId, reason || undefined)

    if (result.success) {
      alert(result.message)
      loadUsers()
    } else {
      alert(`Erro: ${result.error}`)
    }

    setProcessingUserId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Gerenciar Usuários</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Promova usuários a administrador ou remova privilégios
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {users.map((corretor) => (
              <tr key={corretor.user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">
                    {corretor.user.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-500">{corretor.user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                    corretor.user.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {corretor.user.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePromote(corretor.user.id)}
                    disabled={processingUserId === corretor.user.id}
                  >
                    {processingUserId === corretor.user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-1" />
                        Promover a Admin
                      </>
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
