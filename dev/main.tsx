import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.scss';
import 'antd/dist/reset.css';
import '@kne/button-group/dist/index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
