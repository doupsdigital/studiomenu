import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudioMenu — Catálogos Digitais de Alta Conversão",
  description: "Plataforma de catálogos digitais e interativos para Lash Designers, Nail Designers, Clínicas de Estética e Estúdios de Beleza.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400;1,9..144,500&family=Italiana&family=Jost:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-rose-200 selection:text-rose-900">
        {children}
      </body>
    </html>
  );
}

