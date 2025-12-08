import Link from 'next/link'
import { ShieldX, Home } from 'lucide-react'

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <ShieldX className="w-24 h-24 text-red-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border-4 border-red-100 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Acesso Negado
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          Você não tem permissão para acessar esta página. 
          Por favor, faça login com uma conta que tenha as permissões necessárias.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Voltar ao Início
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Fazer Login
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500">
          Se você acredita que deveria ter acesso a esta página, 
          entre em contato com o administrador do sistema.
        </p>
      </div>
    </div>
  )
}
