import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Mindforge - Ucz się grając",
  description: "Grywalizacyjna aplikacja quizowa inspirowana Duolingo. Ucz się programowania, IT, języka polskiego i więcej.",
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="pl" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body>
          {children}
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
