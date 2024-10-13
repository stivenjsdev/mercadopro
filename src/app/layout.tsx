import Header from "@/components/header/Header";
import { Toaster } from "@/components/ui/toaster";
import ReactQueryProvider from "@/utils/providers/ReactQueryProvider";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Mercadopro",
  description:
    "Tu Titulo y Descripción de Producto Generado con IA creado por Sergio Jiménez",
  keywords: [
    "mercadolibre",
    "mercadopro",
    "ia",
    "generador",
    "titulo",
    "descripción",
    "producto",
    "sergio jimenez",
  ],
  openGraph: {
    title: "MercadoPro",
    description:
      "Tu Titulo y Descripción de Producto Generado con IA creado por Sergio Jiménez.",
    url: "https://mercadopro.netlify.app/",
    images: [
      {
        url: "/images/logomercadopro.png",
        width: 400,
        height: 157,
        alt: "Logo MercadoPro",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <Header />
          <main className="p-4">
            <div className="w-full max-w-lg mx-auto space-y-4">{children}</div>
          </main>
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
