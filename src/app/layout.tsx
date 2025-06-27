import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Digitalize Project',
  description: 'Data management and validation platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
