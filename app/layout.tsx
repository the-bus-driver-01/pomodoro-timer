import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pomodoro Timer',
  description: 'A simple pomodoro timer web app',
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