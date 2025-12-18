'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import ImageKit from 'imagekit-javascript'

interface ImageKitUploadProps {
  onUploadComplete: (urls: string[]) => void
  maxFiles?: number
  existingImages?: string[]
  folder?: string
}

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'public_TiW88yZqhiTSzMZJvBq1f+3/9Ig=',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/gfbi8asbh',
  authenticationEndpoint: '/api/imagekit-auth',
})

// Validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export function ImageKitUpload({ 
  onUploadComplete, 
  maxFiles = 10, 
  existingImages = [],
  folder = 'imoveis'
}: ImageKitUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string[]>(existingImages)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Tipo de arquivo não permitido: ${file.type}. Use JPEG, PNG ou WebP.`
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo permitido: 10MB.`
    }
    
    return null
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length === 0) return
    
    if (preview.length + files.length > maxFiles) {
      setError(`Você pode fazer upload de no máximo ${maxFiles} imagens`)
      return
    }

    setError(null)
    setUploading(true)
    setProgress(0)

    const uploadedUrls: string[] = []
    const tempPreviews: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          continue
        }

        // Create preview
        const reader = new FileReader()
        const previewPromise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        const previewUrl = await previewPromise
        tempPreviews.push(previewUrl)
        setPreview(prev => [...prev, previewUrl])

        // Upload to ImageKit
        try {
          const result = await imagekit.upload({
            file: file,
            fileName: `${folder}_${Date.now()}_${file.name}`,
            folder: `/${folder}`,
            useUniqueFileName: true,
            tags: [folder, 'property'],
          })

          if (result && result.url) {
            uploadedUrls.push(result.url)
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError)
          setError(`Erro ao fazer upload de ${file.name}`)
        }

        // Update progress
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }

      if (uploadedUrls.length > 0) {
        onUploadComplete(uploadedUrls)
      }
    } catch (err) {
      console.error('Upload process error:', err)
      setError('Erro durante o processo de upload')
    } finally {
      setUploading(false)
      setProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    const newPreview = preview.filter((_, i) => i !== index)
    setPreview(newPreview)
    
    // If it's an existing image, notify parent to remove it
    if (index < existingImages.length) {
      const remainingExisting = newPreview.filter(url => existingImages.includes(url))
      onUploadComplete(remainingExisting)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Imagens do Imóvel
        </label>
        <span className="text-xs text-gray-500">
          {preview.length}/{maxFiles} imagens
        </span>
      </div>

      {/* Upload Button */}
      <div className="flex gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || preview.length >= maxFiles}
        />
        
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || preview.length >= maxFiles}
          variant="secondary"
          className="flex items-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando... {progress}%
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Fazer Upload
            </>
          )}
        </Button>

        {preview.length >= maxFiles && (
          <p className="text-sm text-orange-600 flex items-center">
            Limite de {maxFiles} imagens atingido
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Image Previews */}
      {preview.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {preview.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>

              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {preview.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-2">
            Nenhuma imagem adicionada
          </p>
          <p className="text-xs text-gray-500">
            Clique no botão acima para fazer upload
          </p>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 space-y-1">
        <p className="font-medium">Diretrizes de upload:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-600">
          <li>Formatos aceitos: JPEG, PNG, WebP</li>
          <li>Tamanho máximo: 10MB por imagem</li>
          <li>Máximo de {maxFiles} imagens por imóvel</li>
          <li>A primeira imagem será a imagem principal</li>
        </ul>
      </div>
    </div>
  )
}
