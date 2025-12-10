import { FilterBar } from '@/components/search/FilterBar'
import { ImoveisList } from '@/components/search/ImoveisList'
import { Suspense } from 'react'
import { PropertyListSkeleton } from '@/components/skeletons'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'

export const dynamic = 'force-dynamic'

async function ImoveisContent({ searchParams }: { searchParams: any }) {
  const {
    tipo,
    cidadeId,
    statusId,
    minValor,
    maxValor,
    quartos,
    search,
  } = searchParams

  // Build query params for API
  const params = new URLSearchParams()
  if (tipo) params.set('tipo', tipo)
  if (cidadeId) params.set('cidadeId', cidadeId)
  if (statusId) params.set('statusId', statusId)
  if (minValor) params.set('minValor', minValor)
  if (maxValor) params.set('maxValor', maxValor)
  if (quartos) params.set('quartos', quartos)
  if (search) params.set('search', search)
  params.set('limit', '12')

  // Fetch from API
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/imoveis?${params.toString()}`, {
    cache: 'no-store',
  })
  const data = await response.json()

  const imoveis = data.success ? data.imoveis : []
  const pagination = data.pagination || { nextCursor: null, hasNextPage: false, limit: 12 }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Buscar Imóveis</h1>
            <p className="text-gray-600">
              {imoveis.length} {imoveis.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
            </p>
          </div>

          <FilterBar currentFilters={searchParams} />

          <div className="mt-8">
            <ImoveisList
              initialImoveis={imoveis}
              initialPagination={pagination}
              filters={searchParams}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function ImoveisPage({ searchParams }: { searchParams: any }) {
  return (
    <Suspense fallback={<PropertyListSkeleton />}>
      <ImoveisContent searchParams={searchParams} />
    </Suspense>
  )
}
