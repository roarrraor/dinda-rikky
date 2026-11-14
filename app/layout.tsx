import type { Metadata, Viewport } from "next";
import {
  Amiri,
  Caveat,
  Cormorant_Garamond,
  Great_Vibes,
  Manrope,
  Marcellus,
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
  title: "The Wedding of Dinda & Rikky",
  description:
    "Undangan pernikahan digital Dinda Intan Pratiwi & Rikky Arisendi. Kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami.",
  keywords: [
    "undangan pernikahan digital",
    "undangan digital",
    "wedding invitation",
    "Dinda & Rikky",
    "undangan online",
  ],
  openGraph: {
    title: "The Wedding of Dinda & Rikky",
    description:
      "Undangan pernikahan digital Dinda Intan Pratiwi & Rikky Arisendi. Kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami.",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Wedding of Dinda & Rikky",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "only light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fonts = [manrope, cormorant, marcellus, caveat, greatVibes, amiri].map((f) => f.variable).join(" ");
  return (
    <html lang="id" className={`${fonts} h-full`}>
      <body className="h-full font-sans antialiased">{children}</body>
    </html>
  );
}
