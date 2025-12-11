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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando imóvel...</p>
        </div>
      </div>
    )
  }

  if (!imovel) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/corretor/imoveis"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Imóvel</h1>
          <p className="text-gray-600 mt-2">
            Atualize as informações do imóvel "{imovel.titulo}"
          </p>
        </div>
      </div>

      <ImovelForm imovel={imovel} onSubmit={handleUpdate} submitLabel="Salvar Alterações" />
    </div>
  )
}
