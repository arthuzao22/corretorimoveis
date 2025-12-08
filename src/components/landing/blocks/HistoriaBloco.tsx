'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HistoriaBlocoProps {
  bloco: any
}

export function HistoriaBloco({ bloco }: HistoriaBlocoProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const imagens = bloco.imagens || []

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % imagens.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + imagens.length) % imagens.length)
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
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

        <div className="relative">
          {imagens.length > 0 && (
            <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
              <img
                src={imagens[currentSlide]}
                alt={`Slide ${currentSlide + 1}`}
                className="w-full h-full object-cover"
              />
              
              {imagens.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {imagens.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentSlide 
                            ? 'bg-white w-8' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {bloco.texto && (
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {bloco.texto}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
