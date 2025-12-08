import { prisma } from './prisma'

type CorretorCacheValue = {
  timestamp: number
  data: any
}

const CACHE_TTL_MS = 30 * 1000 // 30 segundos

const corretorCache = new Map<string, CorretorCacheValue>()

export async function getCorretorBySlug(
  slug: string,
  options?: { includeImoveis?: boolean; includeLandingCount?: boolean; includeLandingBlocosFull?: boolean; imoveisTake?: number }
) {
  const key = `${slug}:${options?.includeImoveis ? 'imoveis' : ''}:${options?.includeLandingCount ? 'landing' : ''}:${options?.includeLandingBlocosFull ? 'landingFull' : ''}:${options?.imoveisTake ?? ''}`
  const now = Date.now()

  const cached = corretorCache.get(key)
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  const include: any = {
    user: {
      select: {
        name: true,
        email: true
      }
    }
  }

  if (options?.includeImoveis) {
    include.imoveis = {
      where: { status: 'ATIVO' },
      orderBy: { createdAt: 'desc' },
      take: options?.imoveisTake
    }
  } else {
    include.imoveis = {
      where: { status: 'ATIVO' },
      select: { id: true }
    }
  }

  if (options?.includeLandingBlocosFull) {
    include.landingBlocos = { where: { ativo: true }, orderBy: { ordem: 'asc' } }
  } else if (options?.includeLandingCount) {
    include.landingBlocos = { where: { ativo: true }, select: { id: true } }
  }

  const corretor = await prisma.corretorProfile.findUnique({
    where: { slug },
    include
  })

  corretorCache.set(key, { timestamp: now, data: corretor })

  return corretor
}

export function clearCorretorCache(slug?: string) {
  if (!slug) {
    corretorCache.clear()
    return
  }

  for (const key of Array.from(corretorCache.keys())) {
    if (key.startsWith(slug + ':')) corretorCache.delete(key)
  }
}
