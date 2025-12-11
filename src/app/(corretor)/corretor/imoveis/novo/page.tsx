'use client'

import { ImovelForm } from '@/components/imoveis/ImovelForm'
import { createImovel } from '@/server/actions/imoveis'

export default function NovoImovelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Novo Imóvel</h1>
        <p className="text-gray-600 mt-2">
          Cadastre um novo imóvel com todas as informações necessárias
        </p>
      </div>

      <ImovelForm onSubmit={createImovel} submitLabel="Criar Imóvel" />
    </div>
  )
}
