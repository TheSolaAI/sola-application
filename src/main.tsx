import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import App from './App';
import './css/style.css';
import './css/satoshi.css';
import 'jsvectormap/dist/css/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';

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
