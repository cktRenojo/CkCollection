import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/hooks/use-cart';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'C&K Apparel - Modern Fashion',
  description: 'Discover the latest trends in fashion with C&K Apparel. Shop our collection of clothing for men and women.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased h-full flex flex-col')}>
        <CartProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </CartProvider>
        <Toaster />
      </body>
    </html>
  );
}
