'use client'

import { useState } from 'react'
import { QrCode, Download, Share2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import QRCode from 'qrcode'

interface QRCodeModalProps {
  imovelId: string
  titulo: string
  isOpen: boolean
  onClose: () => void
}

export function QRCodeModal({ imovelId, titulo, isOpen, onClose }: QRCodeModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Generate QR code when modal opens
  useState(() => {
    if (isOpen && !qrCodeUrl) {
      generateQRCode()
    }
  })

  const getImovelUrl = () => {
    // Get the full URL for the property
    const baseUrl = window.location.origin
    return `${baseUrl}/imovel/${imovelId}`
  }

  const generateQRCode = async () => {
    setLoading(true)
    try {
      const url = getImovelUrl()
      const qrCode = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrCode)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return

    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `qrcode-${imovelId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyLink = async () => {
    const url = getImovelUrl()
    try {
      await navigator.clipboard.writeText(url)
      alert('Link copiado para a área de transferência!')
    } catch (error) {
      console.error('Error copying link:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">QR Code do Imóvel</h2>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{titulo}</p>
        </div>

        {/* QR Code Display */}
        <div className="flex justify-center mb-6">
          {loading ? (
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : qrCodeUrl ? (
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <img src={qrCodeUrl} alt="QR Code" className="w-56 h-56" />
            </div>
          ) : null}
        </div>

        {/* Link */}
        <div className="mb-6">
          <p className="text-xs font-medium text-gray-700 mb-2">Link do imóvel:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={getImovelUrl()}
              readOnly
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
            <Button
              variant="secondary"
              onClick={copyLink}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Share2 className="w-4 h-4" />
              Copiar
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={downloadQRCode}
            disabled={!qrCodeUrl}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Baixar QR Code
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Fechar
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-900 font-medium mb-1">Como usar:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Baixe o QR Code e imprima em panfletos</li>
            <li>• Coloque em placas de "Vende-se"</li>
            <li>• Compartilhe nas redes sociais</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
