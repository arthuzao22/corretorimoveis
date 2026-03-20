'use client'

import { useState, useEffect } from 'react'
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
  useEffect(() => {
    if (isOpen && !qrCodeUrl) {
      generateQRCode()
    }
  }, [isOpen, qrCodeUrl])

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
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">QR Code do Imovel</h2>
                <p className="text-slate-400 text-sm line-clamp-1">{titulo}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* QR Code Display */}
          <div className="flex justify-center mb-6">
            {loading ? (
              <div className="w-56 h-56 bg-slate-100 rounded-xl flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : qrCodeUrl ? (
              <div className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
            ) : null}
          </div>

          {/* Link */}
          <div className="mb-6">
            <p className="text-xs font-medium text-slate-500 mb-2">Link do imovel:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={getImovelUrl()}
                readOnly
                className="flex-1 px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
              />
              <button
                onClick={copyLink}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Copiar
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={downloadQRCode}
              disabled={!qrCodeUrl}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar QR Code
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Fechar
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-xs text-indigo-800 font-semibold mb-2">Como usar:</p>
            <ul className="text-xs text-indigo-700 space-y-1">
              <li>Baixe o QR Code e imprima em panfletos</li>
              <li>Coloque em placas de "Vende-se"</li>
              <li>Compartilhe nas redes sociais</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
