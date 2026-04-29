import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.jsx'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const RootApp = () => {
  if (!clientId) {
    console.warn("Google Client ID is missing. Google Login will not work. Please set VITE_GOOGLE_CLIENT_ID in your .env file.");
  }

  return (
    <GoogleOAuthProvider clientId={clientId || "758410228302-placeholder.apps.googleusercontent.com"}>
      <App />
    </GoogleOAuthProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)
