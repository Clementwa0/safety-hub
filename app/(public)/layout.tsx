import type { ReactNode } from 'react'
import WhatsAppFab from '@/components/shared/WhatsAppFab'
import { Footer, Navbar } from '@/components/storefront'

export default function PublicLayout ({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className='min-h-screen bg-slate-50 pt-16 sm:pt-20 lg:pt-24'>
        {children}
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  )
}
