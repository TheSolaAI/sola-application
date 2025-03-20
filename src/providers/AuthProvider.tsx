'use client';

import * as Sentry from '@sentry/nextjs';
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { Toaster } from 'sonner';
import useThemeManager from '@/store/ThemeManager';
import useIsMobile from '@/utils/isMobile';
import React, { useEffect } from 'react';

const initClarity = () => {
  if (typeof window !== 'undefined') {
    const projectId = 'pprp6bdxj0';
    // Using dynamic import for Clarity to avoid SSR issues
    import('@microsoft/clarity').then((Clarity) => {
      Clarity.default.init(projectId);
    });
  }
};

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  // Access the current theme from Zustand
  const { theme } = useThemeManager();
  const isMobile = useIsMobile();

  // Initialize Clarity on client-side
  useEffect(() => {
    initClarity();
  }, []);

  // Initialize Sentry
  useEffect(() => {
    Sentry.init({
      enabled: process.env.NODE_ENV === 'production',
      dsn: 'https://9b7886f252a8435b9083cf088a03039d@o4508596709097472.ingest.us.sentry.io/4508601347866624',
      integrations: [Sentry.browserTracingIntegration()],
      tracesSampleRate: 1.0,
      tracePropagationTargets: ['localhost'],
      replaysSessionSampleRate: 0.2,
      replaysOnErrorSampleRate: 1.0,
    });
  }, []);

  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!privyAppId) {
    console.warn('NEXT_PUBLIC_PRIVY_APP_ID not set');
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ['email', 'wallet', 'twitter', 'discord'],
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
        embeddedWallets: {
          solana: {
            createOnLogin: 'all-users',
          },
        },
        fundingMethodConfig: {
          moonpay: {
            paymentMethod: 'credit_debit_card',
            uiConfig: {
              accentColor: theme.primary || '#1D1D1F',
              theme: theme.baseTheme,
            },
          },
        },
        appearance: {
          theme: theme.name === 'dark' ? 'dark' : 'light',
          accentColor: theme.primary || '#1D1D1F',
          logo: '/sola_black_logo.svg',
          showWalletLoginFirst: true,
        },
      }}
    >
      <Toaster
        position={isMobile ? 'top-center' : 'bottom-right'}
        duration={1500}
        richColors
      />
      {children}
    </PrivyProvider>
  );
};

export default AuthProvider;
