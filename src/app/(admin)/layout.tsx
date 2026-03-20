import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-slate-800">Admin Portal</span>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:gap-1">
                <Link
                  href="/admin/dashboard"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/corretores"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Corretores
                </Link>
                <Link
                  href="/admin/imoveis"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Imoveis
                </Link>
                <Link
                  href="/admin/landings"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Landing Pages
                </Link>
                <Link
                  href="/admin/leads"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Leads
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-700 font-medium">
                {session.user.name}
              </span>
              <Link
                href="/api/auth/signout"
                className="text-sm text-red-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                Sair
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
