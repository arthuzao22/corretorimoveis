import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-blue-600 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Página não encontrada
          </h1>
          <p className="text-gray-600">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Voltar para a página inicial
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Ir para o login
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Links úteis:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/imoveis"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Ver Imóveis
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/register"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Cadastre-se
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
