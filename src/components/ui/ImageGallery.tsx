'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">Nenhuma imagem disponível</p>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative h-96 rounded-xl overflow-hidden bg-gray-200 group">
          <img
            src={images[currentIndex]}
            alt={`${alt} - Imagem ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          />
          
          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative h-20 rounded-lg overflow-hidden ${
                  index === currentIndex ? 'ring-2 ring-blue-600' : 'ring-1 ring-gray-300'
                }`}
              >
                <img
                  src={image}
                  alt={`${alt} - Miniatura ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
            <img
              src={images[currentIndex]}
              alt={`${alt} - Imagem ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
