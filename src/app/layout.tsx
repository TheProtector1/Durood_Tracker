import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { NextAuthProvider } from "@/components/providers/NextAuthProvider"
import PointsDisplay from "@/components/PointsDisplay"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Durood Tracker",
  description: "Track your daily Durood readings and compete with others",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <PointsDisplay />
          {children}
        </NextAuthProvider>
      </body>
    </html>
  )
}
