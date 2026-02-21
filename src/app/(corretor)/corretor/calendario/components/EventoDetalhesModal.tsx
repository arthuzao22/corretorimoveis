'use client'

import { X, Trash2, CheckCircle, Pencil, Calendar as CalendarIcon, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Evento } from '@/hooks/useEventos'

interface EventoDetalhesModalProps {
    evento: Evento
    onClose: () => void
    onEdit: () => void
    onDelete: () => void
    onComplete: () => void
    loading?: boolean
}

const EVENT_TYPE_LABELS: Record<string, string> = {
    VISITA: 'Visita',
    ACOMPANHAMENTO: 'Follow-up',
    REUNIAO: 'Reunião',
    URGENTE: 'Urgente',
    GERAL: 'Geral',
}

const EVENT_TYPE_GRADIENTS: Record<string, string> = {
    VISITA: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    ACOMPANHAMENTO: 'bg-gradient-to-r from-amber-500 to-orange-500',
    REUNIAO: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    URGENTE: 'bg-gradient-to-r from-red-500 to-rose-500',
    GERAL: 'bg-gradient-to-r from-slate-500 to-gray-500',
}

export function EventoDetalhesModal({
    evento,
    onClose,
    onEdit,
    onDelete,
    onComplete,
    loading = false,
}: EventoDetalhesModalProps) {
    const gradient = EVENT_TYPE_GRADIENTS[evento.tipo] || EVENT_TYPE_GRADIENTS.GERAL

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity duration-200"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
                {/* Header with Event Type */}
                <div className={`p-6 ${gradient} text-white`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm mb-3">
                                {EVENT_TYPE_LABELS[evento.tipo] || evento.tipo}
                            </span>
                            <h2 className="text-2xl font-bold">Detalhes do Evento</h2>
                            <p className="text-white/80 mt-1">
                                {new Date(evento.dataHora).toLocaleString('pt-BR', {
                                    dateStyle: 'long',
                                    timeStyle: 'short',
                                })}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Lead Info */}
                    {evento.lead ? (
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <CalendarIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Lead</p>
                                <p className="text-lg font-bold text-slate-800">{evento.lead.name}</p>
                                <div className="flex flex-wrap gap-3 mt-2">
                                    {evento.lead.phone && (
                                        <a href={`tel:${evento.lead.phone}`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                                            📞 {evento.lead.phone}
                                        </a>
                                    )}
                                    {evento.lead.email && (
                                        <a href={`mailto:${evento.lead.email}`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                                            ✉️ {evento.lead.email}
                                        </a>
                                    )}
                                    {evento.lead.phone && (
                                        <a
                                            href={`https://wa.me/55${evento.lead.phone.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-green-600 hover:underline flex items-center gap-1"
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                            <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                                <CalendarIcon className="w-6 h-6 text-slate-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Lead</p>
                                <p className="text-base text-slate-500 italic">Evento geral — sem lead associado</p>
                            </div>
                        </div>
                    )}

                    {/* Property Info */}
                    {evento.imovel ? (
                        <div className="p-4 border border-slate-200 rounded-xl">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Imóvel</p>
                            <p className="text-lg font-semibold text-slate-800">{evento.imovel.titulo}</p>
                            {(evento.imovel.endereco || evento.imovel.cidade) && (
                                <p className="text-sm text-slate-500 mt-1">
                                    {evento.imovel.endereco ?? ''}{evento.imovel.cidade ? `, ${evento.imovel.cidade}` : ''}{evento.imovel.estado ? ` - ${evento.imovel.estado}` : ''}
                                </p>
                            )}
                            {evento.imovel.valor != null && evento.imovel.valor > 0 && (
                                <p className="text-lg font-bold text-emerald-600 mt-2">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(evento.imovel.valor))}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 border border-slate-200 rounded-xl">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Imóvel</p>
                            <p className="text-sm text-slate-500 italic">Nenhum imóvel associado</p>
                        </div>
                    )}

                    {/* Observation */}
                    {evento.observacao && (
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                            <p className="text-xs font-medium text-amber-700 uppercase tracking-wider mb-2">Observação</p>
                            <p className="text-slate-700">{evento.observacao}</p>
                        </div>
                    )}

                    {/* Completed Badge */}
                    {evento.completed && (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                            <span className="text-emerald-800 font-semibold">Evento concluído</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
                    <Button
                        variant="danger"
                        onClick={onDelete}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <Trash2 size={16} />
                        Excluir
                    </Button>
                    {!evento.completed && (
                        <Button
                            onClick={onComplete}
                            disabled={loading}
                            variant="success"
                            className="flex items-center gap-2"
                        >
                            <CheckCircle size={16} />
                            Concluir
                        </Button>
                    )}
                    <Button
                        onClick={onEdit}
                        disabled={loading}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                        <Pencil size={16} />
                        Editar
                    </Button>
                </div>
            </div>
        </div>
    )
}
