import { Card } from '@/components/ui/Card'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Meu Perfil</h1>

      <Card>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Nome</label>
            <p className="mt-1 text-lg text-gray-900">{session?.user.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1 text-lg text-gray-900">{session?.user.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Tipo de Conta</label>
            <p className="mt-1 text-lg text-gray-900">
              {session?.user.role === 'CORRETOR' ? 'Corretor' : 'Administrador'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
