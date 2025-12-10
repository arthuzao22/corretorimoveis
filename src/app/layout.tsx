import type { Metadata } from "next";
import "./globals.css";
import { LoadingProvider } from "@/context/LoadingContext";
import { GlobalLoading, PageTransitionHandler } from "@/components/loading";

export const metadata: Metadata = {
  title: "Portal Imobiliário - Corretores",
  description: "Sistema de gestão de imóveis para corretores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <LoadingProvider>
          {/* Loading Global - Aparece em toda navegação */}
          <GlobalLoading 
            variant="spinner" 
            color="#2563eb" 
            text="Carregando..."
            showText={true}
          />
          
          {/* Handler de transição de página */}
          <PageTransitionHandler />
          
          {/* Conteúdo da aplicação */}
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}
