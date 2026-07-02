import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { bootstrapSubmitterSession } from './auth/bootstrapSession.js';
import App from './App.js';
import './index.css';

bootstrapSubmitterSession();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
