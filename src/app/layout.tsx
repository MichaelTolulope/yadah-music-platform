import type { Metadata } from "next";
import { Playfair_Display, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// ── Sacred Synth Typefaces ──

// Headlines — Serif authority for gospel/ministry feel
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

// Body & Buttons — Sharp contemporary sans-serif
const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

// Labels & AI data — Monospace for precision/technical feel
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zamar.AI | Divine Production. Human Soul.",
    template: "%s | Zamar.AI",
  },
  description:
    "The world's first AI-powered gospel production ecosystem. Bridging the gap between spiritual inspiration and technical excellence. A Ministry of i-Yadah Network.",
  keywords: [
    "gospel music AI",
    "Christian music production",
    "AI music generation",
    "worship music",
    "Afro-gospel",
    "Zamar AI",
    "i-Yadah Network",
    "gospel producer tools",
  ],
  authors: [{ name: "i-Yadah Network" }],
  creator: "i-Yadah Network",
  metadataBase: new URL("https://zamar.ai"),
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://zamar.ai",
    siteName: "Zamar.AI",
    title: "Zamar.AI | Divine Production. Human Soul.",
    description:
      "AI-powered gospel music production. Generate lyrics, master your mix, and grow your ministry sound.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zamar.AI | Divine Production. Human Soul.",
    description: "AI-powered gospel music production for artistes and producers.",
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
      lang="en"
      className={`
        dark
        ${playfairDisplay.variable}
        ${hankenGrotesk.variable}
        ${jetbrainsMono.variable}
        h-full
      `}
    >
      <head>
        {/* Material Symbols for icons — required by the design system */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className="min-h-full flex flex-col antialiased"
        style={{
          fontFamily: "var(--font-hanken), system-ui, sans-serif",
          backgroundColor: "#131313",
          color: "#e5e2e1",
        }}
      >
        {children}
      </body>
    </html>
  );
}
