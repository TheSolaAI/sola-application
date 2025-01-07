import * as Sentry from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import Clarity from '@microsoft/clarity';
import App from './App';
import './css/style.css';
import './css/satoshi.css';

Sentry.init({
  dsn: 'https://9b7886f252a8435b9083cf088a03039d@o4508596709097472.ingest.us.sentry.io/4508601347866624',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      colorScheme: 'system',
      isEmailRequired: true,
    }),
  ],
  // Tracing
  tracesSampleRate: 1.0,
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost'],
  // Session Replay
  replaysSessionSampleRate: 0.2, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const projectId = 'pprp6bdxj0';
Clarity.init(projectId);

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: false,
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
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
          }}
        >
          <App />
        </PrivyProvider>
      )}
    </Router>
  </React.StrictMode>,
);
