import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource-variable/newsreader/wght.css';
import '@fontsource-variable/newsreader/wght-italic.css';
import '@fontsource-variable/manrope/wght.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/secoes.css';
import App from './App';

const raiz = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);
// HTML pré-renderizado no build (tools/prerender.mjs): hidrata; senão (npm run dev) monta do zero.
if (raiz.hasChildNodes()) hydrateRoot(raiz, app);
else createRoot(raiz).render(app);
