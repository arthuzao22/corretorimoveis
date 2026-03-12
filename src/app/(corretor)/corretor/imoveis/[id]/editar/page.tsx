'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ImovelForm } from '@/components/imoveis/ImovelForm'
import { getImovelById, updateImovel } from '@/server/actions/imoveis'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditarImovelPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [imovel, setImovel] = useState<any>(null)

  useEffect(() => {
    loadImovel()
  }, [id])

  const loadImovel = async () => {
    const result = await getImovelById(id)
    if (result.success && result.imovel) {
      setImovel(result.imovel)
    } else {
      alert('Imóvel não encontrado')
      router.push('/corretor/imoveis')
    }
    setLoading(false)
  }

  const handleUpdate = async (data: any) => {
    return await updateImovel(id, data)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-slate-500">Carregando imóvel...</p>
        </div>
      </div>
    )
  }

  if (!imovel) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/corretor/imoveis"
          className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Editar Imóvel</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Atualize as informações do imóvel "{imovel.titulo}"
          </p>
        </div>
      </div>

      <ImovelForm imovel={imovel} onSubmit={handleUpdate} submitLabel="Salvar Alterações" />
    </div>
  )
}
