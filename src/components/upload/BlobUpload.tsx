'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// =============================================
// TYPES
// =============================================

interface BlobUploadProps {
    /** Callback when upload completes with new URLs */
    onUploadComplete: (urls: string[]) => void
    /** Maximum number of files allowed */
    maxFiles?: number
    /** Pre-existing image URLs */
    existingImages?: string[]
    /** Folder namespace for organized storage */
    folder?: string
}

// =============================================
// CONSTANTS
// =============================================

/** Maximum file size in bytes (10MB) */
const MAX_FILE_SIZE = 10 * 1024 * 1024

/** Allowed MIME types */
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// =============================================
// COMPONENT
// =============================================

/**
 * BlobUpload Component
 * 
 * Handles image uploads to Vercel Blob storage via the /api/upload endpoint.
 * Features:
 * - Multiple file selection
 * - Client-side validation
 * - Progress feedback
 * - Preview grid with remove capability
 * - First image marked as "Principal"
 */
export function BlobUpload({
    onUploadComplete,
    maxFiles = 10,
    existingImages = [],
    folder = 'imoveis'
}: BlobUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [preview, setPreview] = useState<string[]>(existingImages)
    const fileInputRef = useRef<HTMLInputElement>(null)

    /**
     * Validates a file before upload
     */
    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return `Tipo de arquivo não permitido: ${file.type}. Use JPEG, PNG ou WebP.`
        }

        if (file.size > MAX_FILE_SIZE) {
            return `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo: 10MB.`
        }

        return null
    }

    /**
     * Creates a local preview URL for a file
     */
    const createPreview = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
        })
    }

    /**
     * Handles file selection and upload
     */
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])

        if (files.length === 0) return

        // Check max files limit
        if (preview.length + files.length > maxFiles) {
            setError(`Você pode fazer upload de no máximo ${maxFiles} imagens`)
            return
        }

        setError(null)
        setUploading(true)
        setProgress(0)

        const uploadedUrls: string[] = []
        const newPreviews: string[] = [...preview]

        try {
            // Create FormData for upload
            const formData = new FormData()
            formData.append('folder', folder)

            // Validate and add files
            for (const file of files) {
                const validationError = validateFile(file)
                if (validationError) {
                    setError(validationError)
                    continue
                }

                // Add to FormData
                formData.append('files', file)

                // Create local preview immediately
                const previewUrl = await createPreview(file)
                newPreviews.push(previewUrl)
            }

            // Update preview state with local previews
            setPreview(newPreviews)
            setProgress(30)

            // Upload to server
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            setProgress(70)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || `Upload failed: ${response.status}`)
            }

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Erro no upload')
            }

            // Replace local previews with actual URLs
            const existingCount = existingImages.length
            const finalUrls = [
                ...preview.slice(0, existingCount), // Keep existing images
                ...result.urls // Add new uploaded URLs
            ]

            setPreview(finalUrls)
            setProgress(100)

            // Notify parent
            onUploadComplete(finalUrls)

            // Show any partial errors
            if (result.errors && result.errors.length > 0) {
                setError(`Alguns arquivos falharam: ${result.errors.join('; ')}`)
            }

        } catch (err) {
            console.error('Upload error:', err)
            setError(err instanceof Error ? err.message : 'Erro durante o upload')
            // Revert to previous preview state on error
            setPreview(preview)
        } finally {
            setUploading(false)
            setProgress(0)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    /**
     * Removes an image from the list
     */
    const removeImage = (index: number) => {
        const newPreview = preview.filter((_, i) => i !== index)
        setPreview(newPreview)
        onUploadComplete(newPreview)
    }

    return (
        <div className="space-y-4">
            {/* Header */}
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

            {/* Image Previews Grid */}
            {preview.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {preview.map((url, index) => (
                        <div key={`${url}-${index}`} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Remove Button */}
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Principal Badge */}
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
