
'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, X, LogOut, User as UserIcon, LogIn, UserPlus } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Cart } from '@/components/cart';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';

const navLinks = [
  { href: '/', label: 'Women' },
  { href: '/', label: 'Men' },
  { href: '/', label: 'New Arrivals' },
  { href: '/', label: 'Unisex' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const { cartCount } = useCart();
  const { user, isAdmin, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const router = useRouter();
  const isMounted = useMounted();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const AuthNav = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      );
    }

    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAdmin && (
              <DropdownMenuItem onClick={() => router.push('/admin-auth/clark-and-kath09/admin')}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <div className="hidden md:flex items-center gap-2">
        <Button asChild variant="ghost">
            <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
            </Link>
        </Button>
        <Button asChild>
            <Link href="/auth/signup">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
            </Link>
        </Button>
      </div>
    );
  };
  
  const MobileAuthNav = () => {
     if (user) {
        return (
            <div className="border-t pt-4 mt-4">
                 <div className="flex items-center gap-3 px-2 mb-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                        </p>
                    </div>
                </div>
                 {isAdmin && (
                  <Link href="/admin-auth/clark-and-kath09/admin" className="flex items-center w-full text-left p-2 text-lg" onClick={() => setIsMobileMenuOpen(false)}>
                    <UserIcon className="mr-2 h-5 w-5" /> Admin
                  </Link>
                )}
                <button onClick={() => setIsLogoutConfirmOpen(true)} className="flex items-center w-full text-left p-2 text-lg text-destructive">
                    <LogOut className="mr-2 h-5 w-5" /> Logout
                </button>
            </div>
        );
     }

     return (
        <div className="mt-6 flex flex-col gap-2 border-t pt-6">
            <Button asChild variant="default" size="lg" onClick={() => setIsMobileMenuOpen(false)}>
                <Link href="/auth/signup">Sign Up</Link>
            </Button>
            <Button asChild variant="outline" size="lg" onClick={() => setIsMobileMenuOpen(false)}>
                <Link href="/auth/login">Login</Link>
            </Button>
        </div>
     );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <AlertDialog open={isLogoutConfirmOpen} onOpenChange={setIsLogoutConfirmOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You’ll need to sign in again to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "default" })}
              onClick={() => {
                handleLogout();
                if(isMobileMenuOpen) setIsMobileMenuOpen(false);
              }}
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {isAdmin && <div className="flex-1"></div>}

        <Link href={isAdmin ? "/admin-auth/clark-and-kath09/admin" : "/"} className="text-2xl font-bold font-headline">
          C&K Collections
        </Link>

        {!isAdmin && (
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
        )}

        <div className={cn(
            "flex items-center space-x-2",
            isAdmin && "flex-1 justify-end"
        )}>
          <AuthNav />
          
          {isMounted ? (
            <>
              {!isAdmin && (
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
              )}

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                  <div className="flex justify-between items-center border-b pb-4">
                    <Link
                      href={isAdmin ? "/admin-auth/clark-and-kath09/admin" : "/"}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-2xl font-bold font-headline"
                    >
                      C&K Collections
                    </Link>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-6 w-6" />
                      </Button>
                    </SheetClose>
                  </div>
                  
                  {!isAdmin && (
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
                  )}

                  <div className="mt-auto">
                     <MobileAuthNav />
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
             <div className="flex items-center space-x-2">
                {!isAdmin && <Skeleton className="h-10 w-10" />}
                <Skeleton className="h-10 w-10 md:hidden" />
             </div>
          )}
        </div>
      </div>
    </header>
  );
}
