interface VideoBlocoProps {
  bloco: any
}

export function VideoBloco({ bloco }: VideoBlocoProps) {
  // Converter URL do YouTube para embed
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`
    }
    
    return null
  }

  const embedUrl = bloco.videoUrl ? getYouTubeEmbedUrl(bloco.videoUrl) : null

  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4">
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

        {embedUrl && (
          <div className="aspect-video rounded-lg overflow-hidden shadow-xl mb-8">
            <iframe
              src={embedUrl}
              title={bloco.titulo || 'Vídeo'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {bloco.texto && (
          <p className="text-gray-600 text-center max-w-3xl mx-auto">
            {bloco.texto}
          </p>
        )}
      </div>
    </section>
  )
}
