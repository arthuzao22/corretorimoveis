import { imovelRepository } from '@/server/repositories/imovel.repository'
import { ImovelCard } from '@/components/ui/ImovelCard'
import { SearchFilters } from '@/components/search/SearchFilters'
import { Suspense } from 'react'
import { PropertyListSkeleton } from '@/components/skeletons'
import { Building2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function ImoveisContent({ searchParams }: { searchParams: any }) {
  const {
    tipo = 'TODOS',
    cidade,
    estado,
    valorMin,
    valorMax,
    quartos,
    banheiros,
    page = 1,
  } = searchParams

  const result = await imovelRepository.findMany({
    tipo: tipo as any,
    cidade,
    estado,
    valorMin: valorMin ? parseFloat(valorMin) : undefined,
    valorMax: valorMax ? parseFloat(valorMax) : undefined,
    quartos: quartos ? parseInt(quartos) : undefined,
    banheiros: banheiros ? parseInt(banheiros) : undefined,
    status: 'ATIVO',
    page: parseInt(page),
    perPage: 12,
  })

  const { imoveis, total, totalPages, page: currentPage } = result

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Buscar Imóveis</h1>
          <p className="text-gray-600">
            {total} {total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
          </p>
        </div>

        <SearchFilters currentFilters={searchParams} />

        {imoveis.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100 mt-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">
              Nenhum imóvel encontrado com os filtros selecionados.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Tente ajustar os filtros de busca.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {imoveis.map((imovel: any) => (
                <ImovelCard key={imovel.id} imovel={imovel} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {currentPage > 1 && (
                  <a
                    href={`?${new URLSearchParams({ ...searchParams, page: String(currentPage - 1) }).toString()}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Anterior
                  </a>
                )}
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <a
                      key={pageNum}
                      href={`?${new URLSearchParams({ ...searchParams, page: String(pageNum) }).toString()}`}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </a>
                  )
                })}

                {currentPage < totalPages && (
                  <a
                    href={`?${new URLSearchParams({ ...searchParams, page: String(currentPage + 1) }).toString()}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Próxima
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>
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
