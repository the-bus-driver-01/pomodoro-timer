import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pomodoro Timer - Stay Focused & Productive',
  description: 'A simple and effective Pomodoro timer to boost your productivity. Work in focused intervals and track your progress.',
  keywords: 'pomodoro, timer, productivity, focus, work, break, technique',
  author: 'Pomodoro Timer App',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <div className="min-h-screen flex flex-col bg-gray-50">
          {/* Header */}
          <Header />

          {/* Main content area */}
          <main className="flex-grow w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
              <div className="w-full">
                {children}
              </div>
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </body>
    </html>
  );
}