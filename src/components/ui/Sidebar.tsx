'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn, tailwindClasses } from '@/lib/design-system'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  UserCircle, 
  LogOut, 
  Layers, 
  Calendar, 
  Columns, 
  Search,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react'

interface SidebarProps {
  userName: string
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Fechar menu mobile ao mudar de rota
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Prevenir scroll do body quando menu mobile está aberto
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/corretor/dashboard',
      icon: LayoutDashboard
    },
    {
      label: 'Kanban',
      href: '/corretor/kanban',
      icon: Columns
    },
    {
      label: 'Meus Imóveis',
      href: '/corretor/imoveis',
      icon: Building2
    },
    {
      label: 'Leads',
      href: '/corretor/leads',
      icon: Users
    },
    {
      label: 'Calendário',
      href: '/corretor/calendario',
      icon: Calendar
    },
    {
      label: 'Minha Landing',
      href: '/corretor/minha-landing',
      icon: Layers
    },
    {
      label: 'Meu Perfil',
      href: '/corretor/perfil',
      icon: UserCircle
    }
  ]

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={cn(
        "p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between",
        isCollapsed && "lg:justify-center lg:p-4"
      )}>
        <h1 className={cn(
          "text-xl lg:text-2xl font-bold text-indigo-600 transition-all",
          isCollapsed && "lg:hidden"
        )}>
          Portal Corretor
        </h1>
        {isCollapsed && (
          <span className="hidden lg:block text-2xl font-bold text-indigo-600">PC</span>
        )}
        
        {/* Botão fechar mobile */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Search Hint - Desktop */}
      <div className={cn(
        "px-4 pt-4 pb-2 hidden lg:block",
        isCollapsed && "lg:px-2"
      )}>
        <button className={cn(
          "w-full flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-600",
          isCollapsed && "lg:justify-center lg:px-2"
        )}>
          <Search className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span className="text-sm">Buscar...</span>
              <kbd className="ml-auto px-2 py-0.5 text-xs font-semibold bg-white border border-gray-300 rounded">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                tailwindClasses.navigation.item,
                isActive 
                  ? tailwindClasses.navigation.itemActive 
                  : tailwindClasses.navigation.itemDefault,
                isCollapsed && "lg:justify-center lg:px-2"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className={cn(
                "transition-all",
                isCollapsed && "lg:hidden"
              )}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Collapse Toggle - Desktop Only */}
      <div className="hidden lg:block px-4 pb-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          <ChevronLeft className={cn(
            "w-4 h-4 transition-transform",
            isCollapsed && "rotate-180"
          )} />
          {!isCollapsed && <span className="text-sm">Recolher</span>}
        </button>
      </div>

      {/* User info */}
      <div className="p-4 border-t border-gray-200">
        <div className={cn(
          "flex items-center gap-3 px-4 py-3 mb-2",
          isCollapsed && "lg:justify-center lg:px-2"
        )}>
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-indigo-600">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className={cn(
            "flex-1 min-w-0",
            isCollapsed && "lg:hidden"
          )}>
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
          </div>
        </div>
        <Link
          href="/api/auth/signout"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200",
            isCollapsed && "lg:justify-center lg:px-2"
          )}
          title={isCollapsed ? "Sair" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className={cn(
            "font-medium",
            isCollapsed && "lg:hidden"
          )}>Sair</span>
        </Link>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:hidden z-20">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-indigo-600">Portal Corretor</h1>
        <div className="w-10" /> {/* Spacer para centralizar o título */}
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          // Base styles
          "fixed top-0 h-screen bg-white border-r border-gray-200 flex flex-col",
          // Mobile styles
          "left-0 w-72 transform transition-transform duration-300 ease-in-out z-[35]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop styles
          "lg:translate-x-0 lg:transition-[width] lg:duration-200 lg:z-20",
          isCollapsed ? "lg:w-20" : "lg:w-64"
        )}
        aria-label="Menu de navegação"
      >
        <SidebarContent />
      </aside>

      {/* Spacer para o conteúdo principal */}
      <div className={cn(
        "hidden lg:block flex-shrink-0 transition-[width] duration-200",
        isCollapsed ? "w-20" : "w-64"
      )} />
    </>
  )
}

// Hook para usar o estado da sidebar (se necessário em outros componentes)
export function useSidebarWidth() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  useEffect(() => {
    // Poderia usar localStorage ou context para persistir estado
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored) {
      setIsCollapsed(JSON.parse(stored))
    }
  }, [])
  
  return isCollapsed ? 80 : 256
}
