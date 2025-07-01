
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/hooks/use-cart';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { ProductsProvider } from '@/hooks/use-products';
import { AuthProvider } from '@/hooks/use-auth';
import { UserChatWidget } from '@/components/user-chat-widget';

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
      <body className={cn('antialiased h-full flex flex-col')} suppressHydrationWarning>
        <AuthProvider>
          <ProductsProvider>
            <CartProvider>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
              <UserChatWidget />
            </CartProvider>
          </ProductsProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
