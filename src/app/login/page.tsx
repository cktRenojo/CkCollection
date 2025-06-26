
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * This page is deprecated and now redirects to the main login page.
 */
export default function DeprecatedLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/login');
  }, [router]);

  return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
  );
}
