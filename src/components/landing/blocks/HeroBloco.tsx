import { MessageCircle } from 'lucide-react'

interface HeroBlocoProps {
  bloco: any
  whatsapp?: string
}

export function HeroBloco({ bloco, whatsapp }: HeroBlocoProps) {
  const imagemPrincipal = bloco.imagens?.[0]

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {imagemPrincipal && (
        <div className="absolute inset-0 z-0">
          <img
            src={imagemPrincipal}
            alt={bloco.titulo || 'Hero'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {bloco.titulo && (
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            {bloco.titulo}
          </h1>
        )}
        {bloco.subtitulo && (
          <p className="text-xl md:text-2xl text-white mb-8 drop-shadow-lg">
            {bloco.subtitulo}
          </p>
        )}
        {bloco.texto && (
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-lg">
            {bloco.texto}
          </p>
        )}
        {whatsapp && (
          <a
            href={`https://wa.me/55${whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-lg shadow-lg"
          >
            <MessageCircle className="w-6 h-6" />
            Entrar em Contato
          </a>
        )}
      </div>
    </section>
  )
}
