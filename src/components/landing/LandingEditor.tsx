'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BlocoForm } from '@/components/landing/BlocoForm'
import { BlocoItem } from '@/components/landing/BlocoItem'
import { Plus, Eye, Link as LinkIcon } from 'lucide-react'
import {
  createLandingBloco,
  updateLandingBloco,
  deleteLandingBloco,
  reorderLandingBlocos,
  toggleLandingAtiva
} from '@/server/actions/landing'
import Link from 'next/link'

interface LandingEditorProps {
  corretor: any
}

const TIPOS_BLOCO = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'historia', label: 'História da Empresa' },
  { value: 'galeria', label: 'Galeria de Fotos' },
  { value: 'carrossel', label: 'Carrossel' },
  { value: 'cta', label: 'Chamada para Ação' },
  { value: 'imoveis', label: 'Imóveis em Destaque' },
  { value: 'video', label: 'Vídeo' },
  { value: 'contato', label: 'Contato' },
  { value: 'texto', label: 'Bloco de Texto' }
]

export function LandingEditor({ corretor: initialCorretor }: LandingEditorProps) {
  const [corretor, setCorretor] = useState(initialCorretor)
  const [showForm, setShowForm] = useState(false)
  const [tipoSelecionado, setTipoSelecionado] = useState<string | null>(null)
  const [blocoEditando, setBlocoEditando] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const refreshBlocos = async () => {
    // Recarregar a página para pegar os blocos atualizados
    window.location.reload()
  }

  const handleCreateBloco = async (data: any) => {
    if (!tipoSelecionado) return
    
    setLoading(true)
    const result = await createLandingBloco({
      corretorId: corretor.id,
      tipo: tipoSelecionado,
      ...data
    })
    
    if (result.success) {
      setShowForm(false)
      setTipoSelecionado(null)
      await refreshBlocos()
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  const handleUpdateBloco = async (data: any) => {
    if (!blocoEditando) return
    
    setLoading(true)
    const result = await updateLandingBloco(blocoEditando.id, data)
    
    if (result.success) {
      setBlocoEditando(null)
      await refreshBlocos()
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  const handleDeleteBloco = async (blocoId: string) => {
    if (!confirm('Tem certeza que deseja deletar este bloco?')) return
    
    setLoading(true)
    const result = await deleteLandingBloco(blocoId)
    
    if (result.success) {
      await refreshBlocos()
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  const handleMoveBloco = async (blocoId: string, direction: 'up' | 'down') => {
    const blocos = [...corretor.landingBlocos]
    const index = blocos.findIndex(b => b.id === blocoId)
    
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === blocos.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[blocos[index], blocos[newIndex]] = [blocos[newIndex], blocos[index]]

    setLoading(true)
    const result = await reorderLandingBlocos(
      corretor.id,
      blocos.map(b => b.id)
    )
    
    if (result.success) {
      await refreshBlocos()
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  const handleToggleAtivo = async (blocoId: string, ativo: boolean) => {
    setLoading(true)
    const result = await updateLandingBloco(blocoId, { ativo: !ativo })
    
    if (result.success) {
      await refreshBlocos()
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  const handleToggleLandingAtiva = async () => {
    setLoading(true)
    const result = await toggleLandingAtiva(corretor.id, !corretor.landingAtiva)
    
    if (result.success) {
      await refreshBlocos()
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Landing Page: {corretor.user.name}
            </h1>
            <p className="text-slate-500">
              Gerencie os blocos da landing page do corretor
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleToggleLandingAtiva}
              variant={corretor.landingAtiva ? 'outline' : 'primary'}
              disabled={loading}
            >
              {corretor.landingAtiva ? 'Pausar Landing' : 'Ativar Landing'}
            </Button>
            <Link
              href={`/lp/${corretor.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>
          </div>
        </div>

        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${
          corretor.landingAtiva ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
        }`}>
          <span>
            Status: {corretor.landingAtiva ? 'Ativa' : 'Pausada'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Blocos existentes */}
          {corretor.landingBlocos.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Blocos da Landing</h2>
              {corretor.landingBlocos.map((bloco: any, index: number) => (
                <BlocoItem
                  key={bloco.id}
                  bloco={bloco}
                  isFirst={index === 0}
                  isLast={index === corretor.landingBlocos.length - 1}
                  onMoveUp={() => handleMoveBloco(bloco.id, 'up')}
                  onMoveDown={() => handleMoveBloco(bloco.id, 'down')}
                  onEdit={() => setBlocoEditando(bloco)}
                  onDelete={() => handleDeleteBloco(bloco.id)}
                  onToggleAtivo={() => handleToggleAtivo(bloco.id, bloco.ativo)}
                />
              ))}
            </div>
          )}

          {/* Form de edicao */}
          {blocoEditando && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Editar Bloco</h2>
              <BlocoForm
                tipo={blocoEditando.tipo}
                initialData={blocoEditando}
                onSubmit={handleUpdateBloco}
                onCancel={() => setBlocoEditando(null)}
              />
            </div>
          )}

          {/* Form de criacao */}
          {showForm && tipoSelecionado && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Criar Novo Bloco</h2>
              <BlocoForm
                tipo={tipoSelecionado}
                onSubmit={handleCreateBloco}
                onCancel={() => {
                  setShowForm(false)
                  setTipoSelecionado(null)
                }}
              />
            </div>
          )}

          {corretor.landingBlocos.length === 0 && !showForm && (
            <Card className="p-12 text-center">
              <p className="text-slate-500 mb-4">
                Nenhum bloco criado ainda. Comece adicionando um bloco!
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar - Adicionar blocos */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Adicionar Bloco
            </h2>
            <div className="space-y-2">
              {TIPOS_BLOCO.map((tipo) => (
                <button
                  key={tipo.value}
                  onClick={() => {
                    setTipoSelecionado(tipo.value)
                    setShowForm(true)
                    setBlocoEditando(null)
                  }}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-slate-800">{tipo.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Link da Landing
              </h3>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-sm break-all">
                <LinkIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-600">
                  {typeof window !== 'undefined' 
                    ? `${window.location.origin}/lp/${corretor.slug}`
                    : `/lp/${corretor.slug}`}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
