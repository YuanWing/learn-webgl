import React from 'react';
import { createRoot } from 'react-dom/client';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import history from 'history/browser';
import './index.scss';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <HistoryRouter history={history}>
    <App />
  </HistoryRouter>
);
