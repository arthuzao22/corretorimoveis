'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  Layers, 
  UserCircle, 
  LogOut,
  Home,
  LogIn,
  UserPlus,
  Menu,
  X
} from 'lucide-react'
import { signOut } from 'next-auth/react'

export function Navbar() {
  const pathname = usePathname()
  const { user, role, slug, loading } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Não mostrar navbar em páginas públicas específicas
  const shouldHideNavbar = pathname.startsWith('/lp/')

  if (shouldHideNavbar) {
    return null
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  // Links para VISITANTE (não autenticado)
  const visitanteLinks = [
    { label: 'Início', href: '/', icon: Home },
    { label: 'Login', href: '/login', icon: LogIn },
    { label: 'Criar Conta', href: '/register', icon: UserPlus },
  ]

  // Links para CORRETOR
  const corretorLinks = [
    { label: 'Dashboard', href: '/corretor/dashboard', icon: LayoutDashboard },
    { label: 'Meus Imóveis', href: '/corretor/imoveis', icon: Building2 },
    { label: 'Leads', href: '/corretor/leads', icon: Users },
    { label: 'Minha Landing', href: '/corretor/minha-landing', icon: Layers },
    { label: 'Meu Perfil', href: '/corretor/perfil', icon: UserCircle },
  ]

  // Links para ADMIN
  const adminLinks = [
    { label: 'Dashboard Admin', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Corretores', href: '/admin/corretores', icon: Users },
    { label: 'Landings', href: '/admin/landings', icon: Layers },
    { label: 'Imóveis', href: '/admin/imoveis', icon: Building2 },
    { label: 'Leads', href: '/admin/leads', icon: UserCircle },
  ]

  // Determinar links a exibir baseado no role
  let menuLinks = visitanteLinks
  if (role === 'ADMIN') {
    menuLinks = adminLinks
  } else if (role === 'CORRETOR') {
    menuLinks = corretorLinks
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  if (loading) {
    return (
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">ImóvelPro</span>
            </div>
            <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Building2 className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              {role === 'ADMIN' ? 'Admin Portal' : role === 'CORRETOR' ? 'Portal Corretor' : 'ImóvelPro'}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuLinks.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                    active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* Logout Button */}
            {user && (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                <span className="text-sm text-gray-600">
                  {user.name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-1">
              {menuLinks.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                      active
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              {/* Mobile Logout */}
              {user && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="px-4 py-2 text-sm text-gray-600">
                    {user.name || user.email}
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
