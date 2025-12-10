import { FilterBar } from '@/components/search/FilterBar'
import { ImoveisList } from '@/components/search/ImoveisList'
import { Suspense } from 'react'
import { PropertyListSkeleton } from '@/components/skeletons'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { prisma } from '@/lib/prisma'

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

  const limit = 12

  // Build where clause
  const where: any = {
    status: 'ATIVO', // Only show active properties
  }

  if (tipo) {
    where.tipo = tipo
  }

  if (cidadeId) {
    where.cidadeId = cidadeId
  }

  if (statusId) {
    where.statusConfigId = statusId
  }

  if (minValor) {
    where.valor = { ...where.valor, gte: parseFloat(minValor) }
  }

  if (maxValor) {
    where.valor = { ...where.valor, lte: parseFloat(maxValor) }
  }

  if (quartos) {
    where.quartos = { gte: parseInt(quartos) }
  }

  if (search) {
    where.OR = [
      { titulo: { contains: search, mode: 'insensitive' } },
      { descricao: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Fetch directly from database (server-side)
  const imoveisQuery = await prisma.imovel.findMany({
    where,
    select: {
      id: true,
      titulo: true,
      tipo: true,
      valor: true,
      endereco: true,
      cidade: true,
      estado: true,
      quartos: true,
      banheiros: true,
      area: true,
      images: true,
      destaque: true,
      createdAt: true,
      corretor: {
        select: {
          id: true,
          slug: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      cidadeRef: {
        select: {
          id: true,
          nome: true,
          uf: true,
        },
      },
      statusConfig: {
        select: {
          id: true,
          nome: true,
          cor: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit + 1, // Fetch one extra to check for next page
  })

  // Check if there's a next page
  const hasNextPage = imoveisQuery.length > limit
  const imoveis = hasNextPage ? imoveisQuery.slice(0, -1) : imoveisQuery
  const nextCursor = hasNextPage ? imoveis[imoveis.length - 1].id : null

  const pagination = {
    nextCursor,
    hasNextPage,
    limit,
  }

  // Serialize Decimal values
  const serializedImoveis = imoveis.map((imovel) => ({
    ...imovel,
    valor: Number(imovel.valor),
    area: imovel.area ? Number(imovel.area) : null,
  }))

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Buscar Imóveis</h1>
            <p className="text-gray-600">
              {serializedImoveis.length} {serializedImoveis.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
            </p>
          </div>

          <FilterBar currentFilters={searchParams} />

          <div className="mt-8">
            <ImoveisList
              initialImoveis={serializedImoveis}
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
