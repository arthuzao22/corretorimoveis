import Link from 'next/link'
import { Home, MapPin, DollarSign } from 'lucide-react'

interface ImoveisBlocoProps {
  bloco: any
  imoveis: any[]
}

export function ImoveisBloco({ bloco, imoveis }: ImoveisBlocoProps) {
  // Pegar até 8 imóveis mais recentes
  const imoveisExibir = imoveis.slice(0, 8)

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {bloco.titulo && (
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            {bloco.titulo}
          </h2>
        )}
        {bloco.subtitulo && (
          <p className="text-xl text-gray-600 text-center mb-12">
            {bloco.subtitulo}
          </p>
        )}

        {imoveisExibir.length === 0 ? (
          <p className="text-center text-gray-500">
            Nenhum imóvel disponível no momento
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {imoveisExibir.map((imovel) => (
              <Link
                key={imovel.id}
                href={`/imovel/${imovel.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="aspect-video bg-gray-200">
                  {imovel.images?.[0] ? (
                    <img
                      src={imovel.images[0]}
                      alt={imovel.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {imovel.titulo}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{imovel.cidade}, {imovel.estado}</span>
                  </div>

                  <div className="flex items-center gap-2 text-lg font-bold text-blue-600">
                    <DollarSign className="w-5 h-5" />
                    <span>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(imovel.valor)}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      imovel.tipo === 'VENDA' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {imovel.tipo === 'VENDA' ? 'Venda' : 'Aluguel'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {bloco.texto && (
          <p className="text-gray-600 text-center mt-8 max-w-3xl mx-auto">
            {bloco.texto}
          </p>
        )}
      </div>
    </section>
  )
}
