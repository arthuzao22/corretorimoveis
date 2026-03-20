'use client'

import { ImovelForm } from '@/components/imoveis/ImovelForm'
import { createImovel } from '@/server/actions/imoveis'

export default function NovoImovelPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Novo Imóvel</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Cadastre um novo imóvel com todas as informações necessárias
        </p>
      </div>

      <ImovelForm onSubmit={createImovel} submitLabel="Criar Imóvel" />
    </div>
  )
}
