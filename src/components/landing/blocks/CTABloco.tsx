import { MessageCircle } from 'lucide-react'

interface CTABlocoProps {
  bloco: any
  whatsapp?: string
}

export function CTABloco({ bloco, whatsapp }: CTABlocoProps) {
  const imagemFundo = bloco.imagens?.[0]

  return (
    <section className="relative py-24 overflow-hidden">
      {imagemFundo && (
        <div className="absolute inset-0 z-0">
          <img
            src={imagemFundo}
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-600/80" />
        </div>
      )}
      
      {!imagemFundo && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700" />
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {bloco.titulo && (
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {bloco.titulo}
          </h2>
        )}
        {bloco.subtitulo && (
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            {bloco.subtitulo}
          </p>
        )}
        {bloco.texto && (
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            {bloco.texto}
          </p>
        )}
        {whatsapp && (
          <a
            href={`https://wa.me/55${whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-bold rounded-lg transition-colors text-lg shadow-lg"
          >
            <MessageCircle className="w-6 h-6" />
            Fale Comigo Agora
          </a>
        )}
      </div>
    </section>
  )
}
