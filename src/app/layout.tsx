import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Todo',
  description: 'A simple todo app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased flex flex-col">
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <footer className="w-full text-center py-4 text-xs text-zinc-500 border-t border-zinc-800/50">
          &copy; 2026 Asik Mydeen
        </footer>
      </body>
    </html>
  )
}
