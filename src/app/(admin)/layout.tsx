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
      <nav className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-slate-900">
                  Painel Admin
                </span>
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:space-x-1">
                <Link
                  href="/admin/dashboard"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border border-transparent hover:border-slate-100 transition-all"
                >
                  Dashboard
                </Link>

                <Link
                  href="/admin/corretores"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border border-transparent hover:border-slate-100 transition-all"
                >
                  Corretores
                </Link>

                <Link
                  href="/admin/imoveis"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border border-transparent hover:border-slate-100 transition-all"
                >
                  Imoveis
                </Link>

                <Link
                  href="/admin/landings"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border border-transparent hover:border-slate-100 transition-all"
                >
                  Landing Pages
                </Link>

                <Link
                  href="/admin/leads"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border border-transparent hover:border-slate-100 transition-all"
                >
                  Leads
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-700">
                {session.user.name}
              </span>

              <Link
                href="/api/auth/signout"
                className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
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