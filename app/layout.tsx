import { ClerkProvider } from '@clerk/nextjs'
import { Inter, Outfit } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import { InitClient } from './init-client'
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

const calSans = localFont({
  src: '../public/fonts/CalSans-SemiBold.woff2',
  variable: '--font-calsans',
  display: 'swap',
})

export const metadata = {
  title: 'Neura - Your Digital Mind',
  description: 'A next-generation knowledge management app with bi-directional linking and graph visualization'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${outfit.variable} ${calSans.variable}`}>
        <body className={inter.className}>
          <InitClient />
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
