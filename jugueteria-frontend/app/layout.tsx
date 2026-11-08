import type { Metadata } from "next";
import { 
  Geist, 
  Geist_Mono, 
  Fredoka,
  Nunito,
  Kaushan_Script 
} from "next/font/google";
import Providers from "@/components/Providers";
import { SITE_URL } from "@/lib/company";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Juguetería El Gato - Juguetes que hacen feliz",
    template: "%s | Juguetería El Gato",
  },
  description:
    "Descubre nuestra colección de juguetes para todas las edades. LEGO, Barbie, Hot Wheels y más, con entrega en Chancay.",
  keywords: [
    "juguetería",
    "juguetes",
    "Chancay",
    "Huaral",
    "LEGO",
    "Barbie",
    "Hot Wheels",
    "regalos para niños",
  ],
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "Juguetería El Gato",
    title: "Juguetería El Gato - Juguetes que hacen feliz",
    description:
      "Juguetes para todas las edades con entrega a domicilio en Chancay y recojo en tienda.",
    url: SITE_URL,
    images: ["/images/jugueteria_banner_no_borders.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Juguetería El Gato - Juguetes que hacen feliz",
    description:
      "Juguetes para todas las edades con entrega a domicilio en Chancay y recojo en tienda.",
    images: ["/images/jugueteria_banner_no_borders.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
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