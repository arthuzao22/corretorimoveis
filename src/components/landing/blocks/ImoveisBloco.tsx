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
    <section className="py-16 bg-card">
      <div className="max-w-7xl mx-auto px-4">
        {bloco.titulo && (
          <h2 className="text-4xl font-bold text-foreground text-center mb-4">
            {bloco.titulo}
          </h2>
        )}
        {bloco.subtitulo && (
          <p className="text-xl text-muted-foreground text-center mb-12">
            {bloco.subtitulo}
          </p>
        )}

        {imoveisExibir.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Nenhum imóvel disponível no momento
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {imoveisExibir.map((imovel) => (
              <Link
                key={imovel.id}
                href={`/imovel/${imovel.id}`}
                className="bg-background rounded-lg overflow-hidden shadow-lg border border-border hover:shadow-xl hover:border-primary/30 transition-all"
              >
                <div className="aspect-video bg-muted">
                  {imovel.images?.[0] ? (
                    <img
                      src={imovel.images[0]}
                      alt={imovel.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-foreground mb-2 line-clamp-2">
                    {imovel.titulo}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{imovel.cidade}, {imovel.estado}</span>
                  </div>

                  <div className="flex items-center gap-2 text-lg font-bold text-primary">
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
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-sky-500/20 text-sky-400'
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
          <p className="text-muted-foreground text-center mt-8 max-w-3xl mx-auto">
            {bloco.texto}
          </p>
        )}
      </div>
    </section>
  )
}
