'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ChevronUp, ChevronDown, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

interface BlocoItemProps {
  bloco: any
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleAtivo: () => void
}

export function BlocoItem({
  bloco,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onToggleAtivo
}: BlocoItemProps) {
  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      hero: 'Hero Banner',
      historia: 'História da Empresa',
      galeria: 'Galeria de Fotos',
      carrossel: 'Carrossel',
      cta: 'Chamada para Ação',
      imoveis: 'Imóveis em Destaque',
      video: 'Vídeo',
      contato: 'Contato',
      texto: 'Bloco de Texto'
    }
    return labels[tipo] || tipo
  }

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      hero: 'bg-purple-500/20 text-purple-400',
      historia: 'bg-sky-500/20 text-sky-400',
      galeria: 'bg-emerald-500/20 text-emerald-400',
      carrossel: 'bg-amber-500/20 text-amber-400',
      cta: 'bg-rose-500/20 text-rose-400',
      imoveis: 'bg-indigo-500/20 text-indigo-400',
      video: 'bg-pink-500/20 text-pink-400',
      contato: 'bg-teal-500/20 text-teal-400',
      texto: 'bg-muted text-muted-foreground'
    }
    return colors[tipo] || 'bg-muted text-muted-foreground'
  }

  return (
    <Card className={`p-4 ${bloco.ativo ? '' : 'opacity-60'}`}>
      <div className="flex items-start gap-4">
        <div className="flex flex-col gap-1">
          <Button
            onClick={onMoveUp}
            disabled={isFirst}
            variant="outline"
            className="p-2 disabled:opacity-30"
            title="Mover para cima"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            onClick={onMoveDown}
            disabled={isLast}
            variant="outline"
            className="p-2 disabled:opacity-30"
            title="Mover para baixo"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTipoColor(bloco.tipo)}`}>
                {getTipoLabel(bloco.tipo)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onToggleAtivo}
                variant="outline"
                className="p-2"
                title={bloco.ativo ? 'Desativar' : 'Ativar'}
              >
                {bloco.ativo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button
                onClick={onEdit}
                variant="outline"
                className="p-2"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                onClick={onDelete}
                variant="outline"
                className="p-2 text-destructive hover:bg-destructive/10"
                title="Deletar"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {bloco.titulo && (
            <h4 className="font-bold text-foreground mb-1">{bloco.titulo}</h4>
          )}
          {bloco.subtitulo && (
            <p className="text-sm text-muted-foreground mb-1">{bloco.subtitulo}</p>
          )}
          {bloco.texto && (
            <p className="text-sm text-muted-foreground/70 line-clamp-2">{bloco.texto}</p>
          )}
          {bloco.imagens && bloco.imagens.length > 0 && (
            <p className="text-xs text-muted-foreground/60 mt-2">
              {bloco.imagens.length} {bloco.imagens.length === 1 ? 'imagem' : 'imagens'}
            </p>
          )}
          {bloco.videoUrl && (
            <p className="text-xs text-muted-foreground/60 mt-2">Vídeo configurado</p>
          )}
        </div>
      </div>
    </Card>
  )
}
