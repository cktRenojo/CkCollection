
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/hooks/use-cart';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { ProductsProvider } from '@/hooks/use-products';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'C&K Collections - Modern Fashion',
  description: 'Discover the latest trends in fashion with C&K Collections. Shop our collection of clothing for men and women.',
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
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased h-full flex flex-col')} suppressHydrationWarning>
        <AuthProvider>
          <ProductsProvider>
            <CartProvider>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </CartProvider>
          </ProductsProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
