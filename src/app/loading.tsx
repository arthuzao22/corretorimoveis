import { Building2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Icon */}
        <div className="relative">
          <Building2 className="w-16 h-16 text-blue-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando...</h2>
          <p className="text-sm text-gray-600">Por favor, aguarde</p>
        </div>
        
        {/* Progress Dots */}
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:0ms]"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:150ms]"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:300ms]"></div>
        </div>
      </div>
    </div>
  )
}
