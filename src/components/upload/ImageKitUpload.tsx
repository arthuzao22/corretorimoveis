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

// Validate environment variables
const PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
const URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT

if (!PUBLIC_KEY || !URL_ENDPOINT) {
  console.error('ImageKit environment variables not configured properly')
}

const imagekit = PUBLIC_KEY && URL_ENDPOINT ? new ImageKit({
  publicKey: PUBLIC_KEY,
  urlEndpoint: URL_ENDPOINT,
}) : null

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

    if (!imagekit) {
      setError('ImageKit não está configurado. Por favor, configure as variáveis de ambiente.')
      return
    }

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
      // Fetch authentication parameters before uploading
      const authResponse = await fetch('/api/imagekit-auth')

      if (!authResponse.ok) {
        const errorText = await authResponse.text()
        throw new Error(`Failed to get auth params: ${authResponse.status} - ${errorText}`)
      }

      const authParams = await authResponse.json()

      if (!authParams.token || !authParams.signature || !authParams.expire) {
        throw new Error('Invalid auth params received: missing token, signature or expire')
      }

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

        // Upload to ImageKit with improved unique filename
        try {
          // Generate a more unique filename using crypto random values if available
          const timestamp = Date.now()
          const randomSuffix = Math.random().toString(36).substring(2, 9)
          const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          const uploadFileName = `${folder}_${timestamp}_${randomSuffix}_${safeName}`

          // First attempt using the SDK (simple path)
          try {
            const sdkResult = await imagekit.upload({
              file: file,
              fileName: uploadFileName,
              folder: `/${folder}`,
              useUniqueFileName: true,
              tags: [folder, 'property'],
              token: authParams.token,
              signature: authParams.signature,
              expire: authParams.expire,
            })

            if (sdkResult && sdkResult.url) {
              uploadedUrls.push(sdkResult.url)
              continue
            }

            console.warn('SDK upload did not return URL, falling back to manual upload', sdkResult)
          } catch (sdkError) {
            console.warn('SDK upload failed, falling back to manual upload', sdkError)
          }

          // Fallback: upload manually via fetch to ImageKit REST API with retry on invalid signature
          const manualUpload = async (params: any) => {
            const folderPath = folder.replace(/^\//, '') // remove leading slash if any
            const form = new FormData()
            form.append('file', file)
            form.append('fileName', uploadFileName)
            form.append('folder', folderPath)
            form.append('useUniqueFileName', 'true')
            form.append('tags', `${folderPath},property`)
            form.append('publicKey', PUBLIC_KEY || '')
            form.append('token', String(params.token))
            form.append('signature', String(params.signature))
            form.append('expire', String(params.expire))

            const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
              method: 'POST',
              body: form,
            })

            const json = await res.json().catch(() => null)
            return { res, json }
          }

          try {
            // Try manual upload, and if signature invalid, fetch new auth params and retry once
            let attempt = 0
            let lastError: any = null
            let currentAuth = authParams

            while (attempt < 2) {
              const { res, json } = await manualUpload(currentAuth)

              if (res.ok && json && json.url) {
                uploadedUrls.push(json.url)
                break
              }

              const msg = json?.message || json?.error || `status ${res?.status}`

              if (msg && /invalid signature/i.test(msg) && attempt === 0) {
                console.warn('Invalid signature received, fetching new auth params and retrying...')
                try {
                  const authResponseRetry = await fetch('/api/imagekit-auth')
                  const newAuth = await authResponseRetry.json()
                  if (newAuth.token && newAuth.signature && newAuth.expire) {
                    currentAuth = newAuth
                    attempt++
                    continue
                  } else {
                    lastError = new Error(`Retry auth params invalid: ${JSON.stringify(newAuth)}`)
                    break
                  }
                } catch (e) {
                  lastError = e
                  break
                }
              }

              lastError = new Error(`Manual upload failed: ${msg} - ${JSON.stringify(json)}`)
              break
            }

            if (lastError) {
              throw lastError
            }
          } catch (manualError: any) {
            const errorMessage = manualError?.message || JSON.stringify(manualError)
            console.error('Manual upload error details:', {
              error: manualError,
              message: errorMessage,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
            })
            setError(`Erro ao fazer upload de ${file.name}: ${errorMessage}`)
          }
        } catch (uploadError: any) {
          const errorMessage = uploadError?.message || uploadError?.error || JSON.stringify(uploadError)
          console.error('Upload error details:', {
            error: uploadError,
            message: errorMessage,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          })
          setError(`Erro ao fazer upload de ${file.name}: ${errorMessage}`)
        }

        // Update progress
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }

      if (uploadedUrls.length > 0) {
        onUploadComplete(uploadedUrls)
      }
    } catch (err: any) {
      console.error('Upload process error:', err)
      setError(err.message || 'Erro durante o processo de upload')
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

    // Notify parent component about the updated image list
    onUploadComplete(newPreview)
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
