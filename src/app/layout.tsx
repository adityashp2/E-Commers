import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import FlyingCartEffect from "@/components/ui/FlyingCartEffect";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Toko Buket | Rangkaian Buket Cantik untuk Setiap Momen",
    template: "%s | Toko Buket",
  },
  description:
    "Pesan buket bunga, snack, uang, dan boneka untuk hadiah spesial. Pengambilan mudah, pesan via WhatsApp.",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Toko Buket",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${playfairDisplay.variable} ${poppins.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <FlyingCartEffect />
        {children}
      </body>
    </html>
  );
}
