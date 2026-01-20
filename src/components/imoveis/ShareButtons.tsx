'use client'

import { useState } from 'react'
import { Share2, MessageCircle, QrCode, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ShareButtonsProps {
  imovelId: string
  titulo: string
  valor: number
  cidade: string
  estado: string
  onQRCodeClick: () => void
}

export function ShareButtons({ imovelId, titulo, valor, cidade, estado, onQRCodeClick }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const getImovelUrl = () => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/imovel/${imovelId}`
  }

  const getWhatsAppMessage = () => {
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(valor))

    const message = `🏠 *${titulo}*

📍 ${cidade}, ${estado}
💰 ${valorFormatado}

Confira mais detalhes neste link:
${getImovelUrl()}

_Enviado via CorretorImóveis_`

    return encodeURIComponent(message)
  }

  const shareWhatsApp = () => {
    const message = getWhatsAppMessage()
    const whatsappUrl = `https://wa.me/?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const copyLink = async () => {
    const url = getImovelUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying link:', error)
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (e) {
        console.error('Fallback copy failed:', e)
      }
      document.body.removeChild(textarea)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* WhatsApp Share */}
      <Button
        onClick={shareWhatsApp}
        variant="secondary"
        className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </Button>

      {/* Copy Link */}
      <Button
        onClick={copyLink}
        variant="secondary"
        className="flex items-center gap-2"
      >
        <LinkIcon className="w-4 h-4" />
        {copied ? 'Copiado!' : 'Copiar Link'}
      </Button>

      {/* QR Code */}
      <Button
        onClick={onQRCodeClick}
        variant="secondary"
        className="flex items-center gap-2"
      >
        <QrCode className="w-4 h-4" />
        QR Code
      </Button>

      {/* Generic Share (if available) */}
      {typeof navigator !== 'undefined' && navigator.share && (
        <Button
          onClick={async () => {
            try {
              await navigator.share({
                title: titulo,
                text: `Confira este imóvel: ${titulo}`,
                url: getImovelUrl()
              })
            } catch (error) {
              // User cancelled or error occurred
              console.log('Share cancelled or error:', error)
            }
          }}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Compartilhar
        </Button>
      )}
    </div>
  )
}
