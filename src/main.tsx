import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import Clarity from '@microsoft/clarity';
import App from './App';
import './css/style.css';
import './css/satoshi.css';

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
