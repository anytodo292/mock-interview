import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from 'components/App';
import 'styles/index.scss';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Unable to start the application: root element not found.');
}

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  root,
);
