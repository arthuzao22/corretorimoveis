'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface GaleriaBlocoProps {
  bloco: any
}

export function GaleriaBloco({ bloco }: GaleriaBlocoProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const imagens = bloco.imagens || []

  return (
    <section className="py-16 bg-white">
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

        {imagens.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imagens.map((img: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(img)}
                className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              >
                <img
                  src={img}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {bloco.texto && (
          <p className="text-gray-600 text-center mt-8 max-w-3xl mx-auto">
            {bloco.texto}
          </p>
        )}
      </div>

      {/* Modal de zoom */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={selectedImage}
            alt="Imagem ampliada"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
