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

/**
 * Serializes an Imovel object by converting all Decimal fields to numbers
 */
export function serializeImovel<T extends ImovelWithDecimals>(imovel: T): T {
  return {
    ...imovel,
    valor: Number(imovel.valor),
    area: imovel.area ? Number(imovel.area) : null,
    areaTerreno: imovel.areaTerreno ? Number(imovel.areaTerreno) : null,
    condominio: imovel.condominio ? Number(imovel.condominio) : null,
    iptu: imovel.iptu ? Number(imovel.iptu) : null,
    latitude: imovel.latitude ? Number(imovel.latitude) : null,
    longitude: imovel.longitude ? Number(imovel.longitude) : null,
  }
}

/**
 * Serializes an array of Imovel objects
 */
export function serializeImoveis<T extends ImovelWithDecimals>(imoveis: T[]): T[] {
  return imoveis.map(serializeImovel)
}
