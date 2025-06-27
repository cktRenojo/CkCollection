
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function OldAdminSignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin-auth/clark-and-kath09/signup');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
