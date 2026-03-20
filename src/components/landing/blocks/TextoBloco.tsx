interface TextoBlocoProps {
  bloco: any
}

export function TextoBloco({ bloco }: TextoBlocoProps) {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4">
        {bloco.titulo && (
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {bloco.titulo}
          </h2>
        )}
        {bloco.texto && (
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {bloco.texto}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
