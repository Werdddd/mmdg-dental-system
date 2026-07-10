import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MMDG Dental System',
  description: 'Mendez Multispecialty Dental Group',
  icons: {
    icon: '/mmdg-icon.png',
    apple: '/mmdg-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-svh bg-background">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
