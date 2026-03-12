'use client'

import { Building2, Phone, Mail, MapPin } from 'lucide-react'
import { TransitionLink } from '@/components/loading'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-2">
            <TransitionLink href="/" className="flex items-center gap-2 text-2xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors mb-4">
              <Building2 className="w-8 h-8" />
              <span>ImóvelPro</span>
            </TransitionLink>
            <p className="text-slate-400 mb-4 max-w-md">
              Conectamos você aos melhores corretores e imóveis do mercado. 
              Encontre seu próximo lar com facilidade e segurança.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <TransitionLink href="/" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all">
                  Início
                </TransitionLink>
              </li>
              <li>
                <TransitionLink href="/imoveis" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all">
                  Buscar Imóveis
                </TransitionLink>
              </li>
              <li>
                <TransitionLink href="/register" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all">
                  Seja um Corretor
                </TransitionLink>
              </li>
              <li>
                <TransitionLink href="/login" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all">
                  Área do Corretor
                </TransitionLink>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:contato@imovelpro.com" className="hover:text-white transition-colors">
                  contato@imovelpro.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+5511999999999" className="hover:text-white transition-colors">
                  (11) 99999-9999
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm text-center sm:text-left">
              © {currentYear} ImóvelPro. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <TransitionLink href="#" className="text-slate-400 hover:text-white transition-colors">
                Termos de Uso
              </TransitionLink>
              <TransitionLink href="#" className="text-slate-400 hover:text-white transition-colors">
                Privacidade
              </TransitionLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
