import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render( // ! nghĩa là chắc chắn phần tử này tồn tại
  <StrictMode>
    <App />
  </StrictMode>,
);
