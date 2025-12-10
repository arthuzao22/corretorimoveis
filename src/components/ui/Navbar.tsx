'use client'

import { usePathname } from 'next/navigation'
import { Building2, Menu, X, Home, Search, LogIn, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { TransitionLink } from '@/components/loading'

interface NavbarProps {
  transparent?: boolean
}

export function Navbar({ transparent = false }: NavbarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  const navLinks = [
    { href: '/', label: 'Início', icon: Home },
    { href: '/imoveis', label: 'Imóveis', icon: Search },
  ]

  return (
    <header className={`${transparent ? 'bg-white/80 backdrop-blur-md' : 'bg-white'} shadow-sm sticky top-0 z-50`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <TransitionLink 
            href="/" 
            className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Building2 className="w-7 h-7 sm:w-8 sm:h-8" />
            <span>ImóvelPro</span>
          </TransitionLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <TransitionLink
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </TransitionLink>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <TransitionLink
              href="/login"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all font-medium text-sm"
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </TransitionLink>
            <TransitionLink
              href="/register"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar-se
            </TransitionLink>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <TransitionLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </TransitionLink>
              ))}
              
              <div className="border-t border-gray-100 mt-2 pt-2">
                <TransitionLink
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  <LogIn className="w-5 h-5" />
                  Entrar
                </TransitionLink>
                <TransitionLink
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all mt-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Cadastrar-se
                </TransitionLink>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
