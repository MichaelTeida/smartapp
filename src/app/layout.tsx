import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Outfit } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import LiquidGlassFilter from "@/components/ui/LiquidGlassFilter"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
})

export const metadata: Metadata = {
  title: "Mindforge - Elitarna Kuźnia Wiedzy",
  description: "Grywalizacyjna aplikacja quizowa dla IT i nie tylko. Ucz się skuteczniej.",
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="pl" className={`${outfit.variable} font-sans`} suppressHydrationWarning>
        <body className="min-h-[100dvh] antialiased">
          <ThemeProvider>
            <LiquidGlassFilter />
            {children}
          </ThemeProvider>
          <script
            dangerouslySetInnerHTML={{
              __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`,
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
