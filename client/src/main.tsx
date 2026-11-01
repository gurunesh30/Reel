/**
 * Client Main Entry Point
 * Initializes TanStack QueryClient, Global Cinematic Toaster, and Root Application
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { CinematicToaster } from './components/shared/UndoToast';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  },
});

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <CinematicToaster />
      </QueryClientProvider>
    </React.StrictMode>
  );
}
