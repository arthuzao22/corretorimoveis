'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, Loader2, Trash2, Image as ImageIcon, X, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createComment, getLeadComments, deleteComment, type CommentData } from '@/server/actions/comments'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// =============================================
// TYPES
// =============================================

interface CommentSectionProps {
    leadId: string
    currentUserId: string
    isAdmin?: boolean
}

// =============================================
// CONSTANTS
// =============================================

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// =============================================
// COMPONENT
// =============================================

export function CommentSection({ leadId, currentUserId, isAdmin = false }: CommentSectionProps) {
    const [comments, setComments] = useState<CommentData[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [content, setContent] = useState('')
    const [images, setImages] = useState<string[]>([])
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const commentsEndRef = useRef<HTMLDivElement>(null)

    // Load comments on mount
    useEffect(() => {
        loadComments()
    }, [leadId])

    // Scroll to bottom when new comments arrive
    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [comments])

    const loadComments = async () => {
        setLoading(true)
        const result = await getLeadComments(leadId)
        if (result.success && result.comments) {
            setComments(result.comments)
        }
        setLoading(false)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        // Validate files
        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                setError(`Tipo não permitido: ${file.type}`)
                return
            }
            if (file.size > MAX_FILE_SIZE) {
                setError('Arquivo muito grande (máximo 10MB)')
                return
            }
        }

        setError(null)
        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('folder', 'comments')
            files.forEach(file => formData.append('files', file))

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error('Erro no upload')
            }

            const result = await response.json()
            if (result.success && result.urls) {
                setImages(prev => [...prev, ...result.urls])
            } else {
                throw new Error(result.error || 'Erro no upload')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer upload')
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!content.trim() && images.length === 0) {
            setError('Adicione texto ou imagem')
            return
        }

        setError(null)
        setSubmitting(true)

        const result = await createComment(leadId, content.trim(), images)

        if (result.success && result.comment) {
            setComments(prev => [...prev, result.comment!])
            setContent('')
            setImages([])
        } else {
            setError(result.error || 'Erro ao enviar comentário')
        }

        setSubmitting(false)
    }

    const handleDelete = async (commentId: string) => {
        if (!confirm('Deseja excluir este comentário?')) return

        const result = await deleteComment(commentId)
        if (result.success) {
            setComments(prev => prev.filter(c => c.id !== commentId))
        } else {
            setError(result.error || 'Erro ao excluir')
        }
    }

    const canDelete = (comment: CommentData) => {
        return comment.author.id === currentUserId || isAdmin
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">
                    Comentários ({comments.length})
                </h3>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-[200px] max-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>Nenhum comentário ainda</p>
                        <p className="text-sm">Seja o primeiro a comentar!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="group bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-gray-200 transition-colors"
                        >
                            {/* Comment Header */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                                        {comment.author.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">
                                            {comment.author.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(comment.createdAt), {
                                                addSuffix: true,
                                                locale: ptBR
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {canDelete(comment) && (
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                        title="Excluir comentário"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Comment Content */}
                            <p className="text-gray-700 text-sm whitespace-pre-wrap pl-10">
                                {comment.content}
                            </p>

                            {/* Comment Images */}
                            {comment.images.length > 0 && (
                                <div className="mt-3 pl-10 flex flex-wrap gap-2">
                                    {comment.images.map((url, idx) => (
                                        <a
                                            key={idx}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block"
                                        >
                                            <img
                                                src={url}
                                                alt={`Anexo ${idx + 1}`}
                                                className="w-24 h-24 object-cover rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
                                            />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={commentsEndRef} />
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
                <div className="flex flex-wrap gap-2 py-2 border-t border-gray-100">
                    {images.map((url, idx) => (
                        <div key={idx} className="relative group">
                            <img
                                src={url}
                                alt={`Preview ${idx + 1}`}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                                onClick={() => removeImage(idx)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-2">
                    {error}
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-3">
                <div className="flex gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_TYPES.join(',')}
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Anexar imagem"
                    >
                        {uploading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <ImageIcon className="w-5 h-5" />
                        )}
                    </button>

                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Escreva um comentário..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        disabled={submitting}
                    />

                    <Button
                        type="submit"
                        disabled={submitting || (!content.trim() && images.length === 0)}
                        className="px-4"
                    >
                        {submitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
