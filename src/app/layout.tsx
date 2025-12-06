import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
