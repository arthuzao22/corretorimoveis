/**
 * Serialization utilities for converting Prisma Decimal types to plain numbers
 * for safe use in Client Components
 */

type ImovelWithDecimals = {
  valor: any
  area?: any
  areaTerreno?: any
  condominio?: any
  iptu?: any
  latitude?: any
  longitude?: any
  [key: string]: any
}

type SerializedImovel<T extends ImovelWithDecimals> = Omit<T, 'valor' | 'area' | 'areaTerreno' | 'condominio' | 'iptu' | 'latitude' | 'longitude'> & {
  valor: number
  area: number | null
  areaTerreno: number | null
  condominio: number | null
  iptu: number | null
  latitude: number | null
  longitude: number | null
}

/**
 * Serializes an Imovel object by converting all Decimal fields to numbers
 */
export function serializeImovel<T extends ImovelWithDecimals>(imovel: T): SerializedImovel<T> {
  return {
    ...imovel,
    valor: Number(imovel.valor),
    area: imovel.area ? Number(imovel.area) : null,
    areaTerreno: imovel.areaTerreno ? Number(imovel.areaTerreno) : null,
    condominio: imovel.condominio ? Number(imovel.condominio) : null,
    iptu: imovel.iptu ? Number(imovel.iptu) : null,
    latitude: imovel.latitude ? Number(imovel.latitude) : null,
    longitude: imovel.longitude ? Number(imovel.longitude) : null,
  } as SerializedImovel<T>
}

/**
 * Serializes an array of Imovel objects
 */
export function serializeImoveis<T extends ImovelWithDecimals>(imoveis: T[]): SerializedImovel<T>[] {
  return imoveis.map(serializeImovel)
}

