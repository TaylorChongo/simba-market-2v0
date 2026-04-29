import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../lib/utils';

const GoogleLoginButton = ({ setLoading, setError }) => {
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleGoogleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        
        if (!userInfoRes.ok) throw new Error('Failed to fetch user info from Google');
        
        const userInfo = await userInfoRes.json();
        
        const googleData = {
          googleId: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          avatar: userInfo.picture,
          role: 'CLIENT'
        };

        const res = await fetch(`${API_URL}/api/auth/google-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(googleData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        login(data.user, data.token);
        window.location.href = '/'; // Simple redirect
      } catch (err) {
        setError("Google Login failed: " + err.message);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google Login failed: Authentication failed");
    }
  });

  return (
    <button 
      onClick={() => handleGoogleLogin()}
      type="button"
      className="w-full h-12 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-low transition-all flex items-center justify-center gap-3 font-bold text-sm text-on-surface"
    >
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
      {t('connect_with_google')}
    </button>
  );
};

export default GoogleLoginButton;
