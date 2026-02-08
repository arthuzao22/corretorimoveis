import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LoadingProvider } from "@/context/LoadingContext";
import { GlobalLoading, PageTransitionHandler } from "@/components/loading";

export const metadata: Metadata = {
  title: "Portal Imobiliário - Corretores",
  description: "Sistema completo de gestão para corretores de imóveis - Gerencie leads, imóveis e vendas",
  applicationName: "Portal Corretor",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Portal Corretor Imobiliário",
    title: "Portal Imobiliário - Corretores",
    description: "Sistema completo de gestão para corretores de imóveis",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portal Imobiliário - Corretores",
    description: "Sistema completo de gestão para corretores de imóveis",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366F1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Preconnect to Google Fonts for Landing Page themes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <LoadingProvider>
          {/* Loading Global - Aparece em toda navegação */}
          <GlobalLoading
            variant="spinner"
            color="#6366F1"
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

