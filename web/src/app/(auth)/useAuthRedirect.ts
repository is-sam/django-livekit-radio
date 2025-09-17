import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/app/(auth)/AuthProvider';

export function useAuthRedirect() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);
}
