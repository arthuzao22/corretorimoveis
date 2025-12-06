'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getMyLandingPage } from '@/server/actions/landing'
import { ExternalLink, Copy, Eye, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface LandingData {
  id: string
  slug: string
  temaCor: string | null
  fundoCor: string | null
  bannerUrl: string | null
  logoUrl: string | null
  tituloLP: string | null
  subtituloLP: string | null
  textoCTA: string | null
  landingAtiva: boolean
  user: {
    name: string
  }
}

export default function MinhaLandingPage() {
  const [landing, setLanding] = useState<LandingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchLanding = async () => {
      setLoading(true)
      const result = await getMyLandingPage()
      
      if (result.success && result.corretor) {
        setLanding(result.corretor)
      } else {
        alert(result.error || 'Erro ao carregar landing page')
      }
      
      setLoading(false)
    }
    
    fetchLanding()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCopyLink = () => {
    if (!landing) return
    
    const url = `${window.location.origin}/lp/${landing.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  if (!landing) {
    return (
      <div className="p-8">
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">Landing page não encontrada</p>
          </div>
        </Card>
      </div>
    )
  }

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/lp/${landing.slug}`

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Minha Landing Page
        </h1>
        <p className="text-gray-600">
          Visualize e compartilhe sua landing page personalizada
        </p>
      </div>

      {/* Status Banner */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Status da Landing Page
            </h3>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                landing.landingAtiva
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {landing.landingAtiva ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Ativa e Pública
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  Pausada
                </>
              )}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleCopyLink}
              disabled={!landing.landingAtiva}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </>
              )}
            </Button>

            <Link href={`/lp/${landing.slug}`} target="_blank">
              <Button variant="primary" disabled={!landing.landingAtiva}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Landing
              </Button>
            </Link>
          </div>
        </div>

        {!landing.landingAtiva && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            ⚠️ Sua landing page está pausada. Entre em contato com o administrador para ativá-la.
          </div>
        )}
      </Card>

      {/* Link Info */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Link da Sua Landing Page
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={publicUrl}
            readOnly
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-mono text-sm"
          />
          <Button variant="secondary" onClick={handleCopyLink}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Compartilhe este link nas suas redes sociais, WhatsApp e materiais de divulgação para captar leads.
        </p>
      </Card>

      {/* Preview */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Preview da Landing Page
        </h3>
        
        <div
          className="rounded-lg overflow-hidden border-2"
          style={{ backgroundColor: landing.fundoCor || '#F9FAFB' }}
        >
          {/* Header */}
          <div
            className="p-8 text-white"
            style={{ backgroundColor: landing.temaCor || '#3B82F6' }}
          >
            {landing.logoUrl && (
              <img
                src={landing.logoUrl}
                alt="Logo"
                className="h-12 mb-4 object-contain"
              />
            )}
            <h2 className="text-3xl font-bold mb-3">
              {landing.tituloLP || 'Encontre o Imóvel dos Seus Sonhos'}
            </h2>
            <p className="text-lg opacity-90">
              {landing.subtituloLP || 'Imóveis de qualidade com atendimento personalizado'}
            </p>
          </div>

          {/* Banner */}
          {landing.bannerUrl && (
            <div className="w-full h-64 bg-gray-200">
              <img
                src={landing.bannerUrl}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* CTA */}
          <div className="p-8 text-center">
            <button
              className="px-8 py-4 rounded-lg text-white font-semibold text-lg shadow-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: landing.temaCor || '#3B82F6' }}
            >
              {landing.textoCTA || 'Ver Imóveis Disponíveis'}
            </button>
          </div>

          {/* Info Section */}
          <div className="p-8 bg-white bg-opacity-50">
            <p className="text-center text-gray-600">
              Seus imóveis aparecerão aqui automaticamente
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
          <p className="font-semibold mb-2">ℹ️ Informações Importantes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Apenas o administrador pode editar o design e conteúdo da landing page</li>
            <li>Seus imóveis ativos aparecem automaticamente na landing</li>
            <li>Leads capturados pela landing aparecem no seu painel</li>
            <li>O link pode ser usado em qualquer lugar: redes sociais, WhatsApp, e-mail, etc.</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
