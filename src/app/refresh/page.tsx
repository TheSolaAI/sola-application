'use client';
import { Suspense } from 'react';
import PageLoading from '@/components/common/PageLoading';
import RefreshToken from '@/app/refresh/RefreshToken';

export default function RefreshPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <RefreshToken />
    </Suspense>
  );
}
