import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './AuthContext';
import { HelmetProvider } from 'react-helmet-async';

window.handleGoogleSignIn = (response) => {
  window.dispatchEvent(new CustomEvent("google-signin", { detail: response }));
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);

reportWebVitals();