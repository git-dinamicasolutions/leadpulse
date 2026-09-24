import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { StartClient } from '@tanstack/react-start/client';
import { createRouter } from './router';
import './styles.css';

const router = createRouter();

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>
);
