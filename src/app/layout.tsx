import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'todo',
  description: 'A simple todo app with Google login',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>{children}</body>
    </html>
  )
}
