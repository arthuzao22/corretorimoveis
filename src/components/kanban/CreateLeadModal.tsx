'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Plus, Building2, User, Phone, Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createLeadFromKanban } from '@/server/actions/leads'

interface Imovel {
    id: string
    titulo: string
    tipo: 'VENDA' | 'ALUGUEL'
}

interface CreateLeadModalProps {
    isOpen: boolean
    onClose: () => void
    onCreated: () => void
    columnId?: string
    columnName?: string
}

export function CreateLeadModal({
    isOpen,
    onClose,
    onCreated,
    columnId,
    columnName
}: CreateLeadModalProps) {
    const [loading, setLoading] = useState(false)
    const [loadingImoveis, setLoadingImoveis] = useState(false)
    const [error, setError] = useState('')
    const [imoveis, setImoveis] = useState<Imovel[]>([])

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: '',
        imovelId: ''
    })

    useEffect(() => {
        if (isOpen) {
            loadImoveis()
        }
    }, [isOpen])

    const loadImoveis = async () => {
        setLoadingImoveis(true)
        try {
            const res = await fetch('/api/imoveis')
            const data = await res.json()

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    setError('Sessão expirada. Faça login novamente.')
                    return
                }
                throw new Error(data.error || 'Erro ao carregar imóveis')
            }

            if (data.success && data.imoveis) {
                setImoveis(data.imoveis)
            } else {
                throw new Error(data.error || 'Resposta inválida')
            }
        } catch (err) {
            console.error('Erro ao carregar imóveis:', err)
            setError('Não foi possível carregar a lista de imóveis')
        } finally {
            setLoadingImoveis(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await createLeadFromKanban({
                name: formData.name,
                phone: formData.phone,
                email: formData.email || undefined,
                message: formData.message || undefined,
                imovelId: formData.imovelId || undefined,
                kanbanColumnId: columnId
            })

            if (result.success) {
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    message: '',
                    imovelId: ''
                })
                onCreated()
                onClose()
            } else {
                setError(result.error || 'Erro ao criar lead')
            }
        } catch {
            setError('Erro ao criar lead')
        } finally {
            setLoading(false)
        }
    }

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '')
        if (numbers.length <= 2) return numbers
        if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
        if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
                
                {/* Header */}
                <div className="p-6 bg-slate-900 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Novo Lead</h2>
                                {columnName && (
                                    <p className="text-white/70 text-sm">
                                        Será adicionado em: {columnName}
                                    </p>
                                )}
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Nome */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                            <User className="w-4 h-4" />
                            Nome *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nome do cliente"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white transition-all"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Telefone */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                            <Phone className="w-4 h-4" />
                            Telefone *
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                            placeholder="(00) 00000-0000"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white transition-all"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                            <Mail className="w-4 h-4" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="email@exemplo.com"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white transition-all"
                            disabled={loading}
                        />
                    </div>

                    {/* Imóvel */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                            <Building2 className="w-4 h-4" />
                            Imóvel de interesse (opcional)
                        </label>
                        <select
                            value={formData.imovelId}
                            onChange={(e) => setFormData({ ...formData, imovelId: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white transition-all"
                            disabled={loading || loadingImoveis}
                        >
                            <option value="">Nenhum imóvel selecionado</option>
                            {imoveis.map((imovel) => (
                                <option key={imovel.id} value={imovel.id}>
                                    {imovel.titulo} ({imovel.tipo === 'VENDA' ? 'Venda' : 'Aluguel'})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Mensagem */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                            <MessageSquare className="w-4 h-4" />
                            Observação
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Anotações sobre o lead..."
                            rows={3}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white transition-all resize-none"
                            disabled={loading}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            disabled={loading || !formData.name || !formData.phone}
                            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 rounded-xl"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Criar Lead
                                </>
                            )}
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    )
}