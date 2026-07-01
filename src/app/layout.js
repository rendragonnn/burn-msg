import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono-jb',
});

export const metadata = {
  title: 'BurnMsg — Send Self-Destructing Encrypted Messages',
  description: 'Send encrypted messages that burn after being read. Zero-knowledge encryption, one-time view, no traces.',
  keywords: 'burn message, encrypted messages, self-destruct, secret, privacy, zero-knowledge',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'BurnMsg',
    description: 'Send encrypted messages that burn after being read.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <ErrorBoundary>
          <Navbar />
          <div className="pageContent">
            {children}
          </div>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
