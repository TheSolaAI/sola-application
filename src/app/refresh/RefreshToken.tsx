'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import PageLoading from '@/components/common/PageLoading';

export default function RefreshToken() {
  const { getAccessToken } = usePrivy();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function refreshAndRedirect() {
      try {
        const token = await getAccessToken();
        // Get and decode the redirect URI, defaulting to dashboard if successful
        const redirectUri = searchParams.get('redirect_uri')
          ? decodeURIComponent(searchParams.get('redirect_uri') || '')
          : '/dashboard/chat';

        if (token) {
          // User is authenticated, redirect to the intended destination
          router.replace(redirectUri);
        } else {
          // User is not authenticated, redirect to home
          router.replace('/');
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        router.replace('/');
      }
    }

    refreshAndRedirect();
  }, [getAccessToken, router, searchParams]);

  return <PageLoading />;
}
