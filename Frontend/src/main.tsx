import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import App from './App.tsx';
import './index.css';
import './App.css';
import { apolloClient } from './apollo-client';
import { AuthProvider } from './context/AuthContext.tsx';
import { registerServiceWorker, setupInstallPrompt } from './utils/pwa.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>,
);

registerServiceWorker();
setupInstallPrompt();
