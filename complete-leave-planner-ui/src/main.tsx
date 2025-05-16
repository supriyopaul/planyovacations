import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Load Inter font
const inter = document.createElement('link');
inter.rel = 'stylesheet';
inter.href = 'https://rsms.me/inter/inter.css';
document.head.appendChild(inter);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
