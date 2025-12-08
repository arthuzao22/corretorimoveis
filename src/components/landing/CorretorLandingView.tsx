'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Copy, Eye, Layers, CheckCircle } from 'lucide-react'

interface CorretorLandingViewProps {
  corretor: any
}

export function CorretorLandingView({ corretor }: CorretorLandingViewProps) {
  const [copied, setCopied] = useState(false)
  const [fullUrl, setFullUrl] = useState('')
  const landingPath = `/lp/${corretor.slug}`

  // Atualiza a URL completa apenas no cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFullUrl(`${window.location.origin}${landingPath}`)
    }
  }, [landingPath])

  const handleCopyLink = () => {
    const urlToCopy = fullUrl || landingPath
    navigator.clipboard.writeText(urlToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      hero: 'Hero Banner',
      historia: 'História da Empresa',
      galeria: 'Galeria de Fotos',
      carrossel: 'Carrossel',
      cta: 'Chamada para Ação',
      imoveis: 'Imóveis em Destaque',
      video: 'Vídeo',
      contato: 'Contato',
      texto: 'Bloco de Texto'
    }
    return labels[tipo] || tipo
  }

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      hero: 'bg-purple-100 text-purple-700',
      historia: 'bg-blue-100 text-blue-700',
      galeria: 'bg-green-100 text-green-700',
      carrossel: 'bg-yellow-100 text-yellow-700',
      cta: 'bg-red-100 text-red-700',
      imoveis: 'bg-indigo-100 text-indigo-700',
      video: 'bg-pink-100 text-pink-700',
      contato: 'bg-teal-100 text-teal-700',
      texto: 'bg-gray-100 text-gray-700'
    }
    return colors[tipo] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Minha Landing Page
        </h1>
        <p className="text-gray-600">
          Visualize sua landing page e compartilhe o link com seus clientes
        </p>
      </div>

      {/* Status Card */}
      <Card className="mb-8 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Status da Landing
            </h2>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              corretor.landingAtiva ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              <span className="font-medium">
                {corretor.landingAtiva ? '✓ Ativa' : '○ Pausada'}
              </span>
            </div>
          </div>
          <a
            href={landingPath}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-5 h-5" />
            Ver Landing Page
          </a>
        </div>

        {/* Copy Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link da sua Landing Page
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={fullUrl || landingPath}
              readOnly
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
            />
            <Button
              onClick={handleCopyLink}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copiar Link
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Compartilhe este link em suas redes sociais, WhatsApp ou e-mail
          </p>
        </div>
      </Card>

      {/* Blocos da Landing */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Layers className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Blocos da Landing Page
          </h2>
        </div>

        {corretor.landingBlocos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Sua landing page ainda não possui blocos configurados.
            </p>
            <p className="text-sm text-gray-400">
              Entre em contato com o administrador para configurar sua landing page.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {corretor.landingBlocos.map((bloco: any, index: number) => (
              <div
                key={bloco.id}
                className={`border border-gray-200 rounded-lg p-4 ${
                  bloco.ativo ? 'bg-white' : 'bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoColor(bloco.tipo)}`}>
                      {getTipoLabel(bloco.tipo)}
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${
                    bloco.ativo ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {bloco.ativo ? 'Ativo' : 'Desativado'}
                  </span>
                </div>

                {bloco.titulo && (
                  <h3 className="font-bold text-gray-900 mb-1">{bloco.titulo}</h3>
                )}
                {bloco.subtitulo && (
                  <p className="text-sm text-gray-600 mb-1">{bloco.subtitulo}</p>
                )}
                {bloco.texto && (
                  <p className="text-sm text-gray-500 mt-2">{bloco.texto}</p>
                )}
                {bloco.imagens && bloco.imagens.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    {bloco.imagens.length} {bloco.imagens.length === 1 ? 'imagem' : 'imagens'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Apenas o administrador pode editar os blocos da sua landing page. 
          Se precisar de alterações, entre em contato com o suporte.
        </p>
      </div>
    </div>
  )
}
