import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LoadingProvider } from "@/context/LoadingContext";
import { GlobalLoading, PageTransitionHandler } from "@/components/loading";

export const metadata: Metadata = {
  title: "Portal Imobiliário - Corretores",
  description: "Sistema completo de gestão para corretores de imóveis - Gerencie leads, imóveis e vendas",
  manifest: "/manifest.json",
  applicationName: "Portal Corretor",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Portal Corretor",
  },
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
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#6366F1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Portal Corretor" />
        
        {/* Preconnect to Google Fonts for Landing Page themes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA Splash Screens for iOS */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-2048-2732.jpg"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1170-2532.jpg"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
        />
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
