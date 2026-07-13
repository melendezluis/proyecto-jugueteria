import type { Metadata } from "next";
import { 
  Geist, 
  Geist_Mono, 
  Playfair_Display, 
  Great_Vibes, 
  Inter,
  Nunito // 👈 Agregar Nunito
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

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// 👇 Agregar Nunito
const nunito = Nunito({
  variable: "--font-nunito", // 👈 Importante: la variable CSS
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${greatVibes.variable} ${inter.variable} ${nunito.variable} h-full antialiased`} // 👈 Agregar nunito.variable
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}