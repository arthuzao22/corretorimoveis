import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { GlobalSearchProvider } from '@/components/search/GlobalSearchProvider'

export const dynamic = 'force-dynamic'

export default async function CorretorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'CORRETOR') {
    redirect('/login')
  }

  return (
    <GlobalSearchProvider>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar userName={session.user.name || 'Usuário'} />
        <main className="flex-1 min-w-0 pt-16 lg:pt-0 lg:ml-0">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </GlobalSearchProvider>
  )
}
