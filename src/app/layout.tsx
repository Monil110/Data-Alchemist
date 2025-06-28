import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import ErrorBoundary from '@/components/common/error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Data Alchemist - AI-Powered Data Management Platform',
  description: 'Modern, AI-powered data management platform for resource allocation, validation, and business rule configuration. Upload CSV/XLSX files, validate data, create business rules, and export clean data.',
  keywords: 'data management, validation, business rules, AI, CSV, XLSX, resource allocation',
  authors: [{ name: 'Monil110' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Data Alchemist',
    description: 'AI-Powered Data Management Platform',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <ErrorBoundary>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}
