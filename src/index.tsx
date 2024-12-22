import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MoonPayProvider } from '@moonpay/moonpay-react';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <MoonPayProvider apiKey="pk_test_67MomhgGlk3IR5X36b8Mc25VJT71TpA" debug>
      <App />
    </MoonPayProvider>
  </React.StrictMode>
);
reportWebVitals();
