import * as Sentry from '@sentry/react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import Clarity from '@microsoft/clarity';
import App from './App';
import './css/style.css';
import './css/satoshi.css';
import { Toaster } from 'sonner';
import useThemeManager from './models/ThemeManager.ts';

// Sentry Initialization
Sentry.init({
  enabled: process.env.ENVIORNMENT === 'production',
  dsn: 'https://9b7886f252a8435b9083cf088a03039d@o4508596709097472.ingest.us.sentry.io/4508601347866624',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      colorScheme: 'system',
      isEmailRequired: true,
      showBranding: false,
    }),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ['localhost'],
  replaysSessionSampleRate: 0.2,
  replaysOnErrorSampleRate: 1.0,
});

// Clarity Analytics
const projectId = 'pprp6bdxj0';
Clarity.init(projectId);

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: false,
});

const RootApp = () => {
  // Access the current theme from Zustand
  const { theme } = useThemeManager();

  return (
    <Router>
      {process.env.PRVI_APP_ID && (
        <PrivyProvider
          appId={process.env.PRVI_APP_ID}
          config={{
            loginMethods: ['email', 'wallet'],
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
              logo: '/path-to-your-logo.svg',
              showWalletLoginFirst: true,
            },
          }}
        >
          <Toaster position="top-right" richColors />
          <App />
        </PrivyProvider>
      )}
    </Router>
  );
};

// Render the App
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RootApp />,
);
