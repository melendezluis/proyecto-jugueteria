import type { Metadata } from "next";
import { 
  Geist, 
  Geist_Mono, 
  Fredoka,
  Nunito,
  Kaushan_Script 
} from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// 👇 Agregar Nunito
const nunito = Nunito({
  variable: "--font-nunito", 
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

// 👇 Agregar Kaushan Script (tipografía para "El Gato")
const kaushan = Kaushan_Script({
  variable: "--font-kaushan",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Juguetería El Gato - Juguetes que hacen feliz",
  description: "Descubre nuestra colección de juguetes para todas las edades. LEGO, Barbie, Hot Wheels y más.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} ${nunito.variable} ${kaushan.variable} h-full antialiased`} // 👈 Agregar kaushan.variable
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}