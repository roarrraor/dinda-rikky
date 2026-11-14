import type { Metadata, Viewport } from "next";
import {
  Amiri,
  Caveat,
  Cormorant_Garamond,
  Great_Vibes,
  Manrope,
  Marcellus,
  Pinyon_Script,
} from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--ff-manrope", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--ff-cormorant",
  display: "swap",
});
const pinyon = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--ff-pinyon", display: "swap" });
const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--ff-marcellus", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--ff-caveat", display: "swap" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--ff-great-vibes", display: "swap" });
const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--ff-amiri",
  display: "swap",
});

export const metadata: Metadata = {
  title: "kalabertemu.id - Undangan Pernikahan Digital",
  description:
    "Buat undangan pernikahan digital yang elegan, interaktif, dan mudah dibagikan. Pilih dari berbagai tema cantik mulai Rp 39.000.",
  authors: [{ name: "kalabertemu.id", url: "https://kalabertemu.id" }],
  keywords: [
    "undangan pernikahan digital",
    "undangan digital",
    "wedding invitation",
    "kalabertemu.id",
    "undangan online",
  ],
  openGraph: {
    title: "kalabertemu.id - Undangan Pernikahan Digital",
    description:
      "Buat undangan pernikahan digital yang elegan, interaktif, dan mudah dibagikan. Pilih dari berbagai tema cantik mulai Rp 39.000.",
    url: "https://kalabertemu.id",
    siteName: "kalabertemu.id",
    locale: "id_ID",
    type: "website",
    images: [{ url: "https://kalabertemu.id/assets/img-share-cover.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@kalabertemu",
    title: "kalabertemu.id - Undangan Pernikahan Digital",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "only light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fonts = [manrope, cormorant, pinyon, marcellus, caveat, greatVibes, amiri].map((f) => f.variable).join(" ");
  return (
    <html lang="id" className={`${fonts} h-full`}>
      <body className="h-full font-sans antialiased">{children}</body>
    </html>
  );
}
