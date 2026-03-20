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
      hero: 'bg-purple-500/20 text-purple-400',
      historia: 'bg-sky-500/20 text-sky-400',
      galeria: 'bg-emerald-500/20 text-emerald-400',
      carrossel: 'bg-amber-500/20 text-amber-400',
      cta: 'bg-rose-500/20 text-rose-400',
      imoveis: 'bg-indigo-500/20 text-indigo-400',
      video: 'bg-pink-500/20 text-pink-400',
      contato: 'bg-teal-500/20 text-teal-400',
      texto: 'bg-muted text-muted-foreground'
    }
    return colors[tipo] || 'bg-muted text-muted-foreground'
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Minha Landing Page
        </h1>
        <p className="text-muted-foreground">
          Visualize sua landing page e compartilhe o link com seus clientes
        </p>
      </div>

      {/* Status Card */}
      <Card className="mb-8 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Status da Landing
            </h2>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              corretor.landingAtiva ? 'bg-emerald-500/20 text-emerald-400' : 'bg-muted text-muted-foreground'
            }`}>
              <span className="font-medium">
                {corretor.landingAtiva ? 'Ativa' : 'Pausada'}
              </span>
            </div>
          </div>
          <a
            href={landingPath}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Eye className="w-5 h-5" />
            Ver Landing Page
          </a>
        </div>

        {/* Copy Link */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Link da sua Landing Page
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={fullUrl || landingPath}
              readOnly
              className="flex-1 px-4 py-3 border border-input rounded-lg bg-muted text-foreground font-mono text-sm"
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
          <p className="text-sm text-muted-foreground mt-2">
            Compartilhe este link em suas redes sociais, WhatsApp ou e-mail
          </p>
        </div>
      </Card>

      {/* Blocos da Landing */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Layers className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">
            Blocos da Landing Page
          </h2>
        </div>

        {corretor.landingBlocos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Sua landing page ainda não possui blocos configurados.
            </p>
            <p className="text-sm text-muted-foreground/70">
              Entre em contato com o administrador para configurar sua landing page.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {corretor.landingBlocos.map((bloco: any, index: number) => (
              <div
                key={bloco.id}
                className={`border border-border rounded-lg p-4 ${
                  bloco.ativo ? 'bg-card' : 'bg-muted opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoColor(bloco.tipo)}`}>
                      {getTipoLabel(bloco.tipo)}
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${
                    bloco.ativo ? 'text-emerald-400' : 'text-muted-foreground'
                  }`}>
                    {bloco.ativo ? 'Ativo' : 'Desativado'}
                  </span>
                </div>

                {bloco.titulo && (
                  <h3 className="font-bold text-foreground mb-1">{bloco.titulo}</h3>
                )}
                {bloco.subtitulo && (
                  <p className="text-sm text-muted-foreground mb-1">{bloco.subtitulo}</p>
                )}
                {bloco.texto && (
                  <p className="text-sm text-muted-foreground/70 mt-2">{bloco.texto}</p>
                )}
                {bloco.imagens && bloco.imagens.length > 0 && (
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    {bloco.imagens.length} {bloco.imagens.length === 1 ? 'imagem' : 'imagens'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-sm text-primary">
          <strong>Nota:</strong> Apenas o administrador pode editar os blocos da sua landing page. 
          Se precisar de alterações, entre em contato com o suporte.
        </p>
      </div>
    </div>
  )
}
