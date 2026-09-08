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
      </head>
      <body className="antialiased selection:bg-rose-200 selection:text-rose-900">
        {children}
      </body>
    </html>
  );
}
