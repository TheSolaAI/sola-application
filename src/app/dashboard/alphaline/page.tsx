'use client';

import React from 'react';
import { AlphalineDataDisplay } from '@/components/common/AlphalineDataDisplay';

export default function AlphalineDashboardPage() {
  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <AlphalineDataDisplay title="Alphaline Live Feed" />
    </div>
  );
}
