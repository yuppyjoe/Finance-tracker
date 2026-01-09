import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/layout/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Finance Tracker',
  description: 'Hybrid Business + Family Finance Tracker',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-200 py-4">
            <div className="container mx-auto px-4 text-center text-sm text-gray-600">
              <p>Finance Tracker v1.0 • Data stored locally in your browser</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
