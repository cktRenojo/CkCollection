'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Cart } from '@/components/cart';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';

const navLinks = [
  { href: '/#', label: 'Women' },
  { href: '/#', label: 'Men' },
  { href: '/#', label: 'New Arrivals' },
  { href: '/#', label: 'Best Sellers' },
  { href: '/contact', label: 'Contact' },
  { href: '/admin', label: 'Admin' },
];

export default function Header() {
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold font-headline">
          C&K Collections
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Open cart</span>
              </Button>
            </SheetTrigger>
            <Cart />
          </Sheet>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center border-b pb-4">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold font-headline">
                        C&K Collections
                        </Link>
                        <SheetClose asChild>
                             <Button variant="ghost" size="icon">
                                <X className="h-6 w-6" />
                             </Button>
                        </SheetClose>
                    </div>
                    <nav className="flex flex-col space-y-4 mt-6">
                    {navLinks.map((link) => (
                        <Link
                        key={link.label}
                        href={link.href}
                        className="text-lg transition-colors hover:text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
                        >
                        {link.label}
                        </Link>
                    ))}
                    </nav>
                </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
