import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../lib/utils';
import Input from '../components/Input';
import Button from '../components/Button';
import { ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      login(data.user, data.token);
      
      // Role-based redirection
      if (data.user.role === 'VENDOR') {
        navigate('/dashboard/vendor');
      } else if (data.user.role === 'ADMIN') {
        navigate('/dashboard/admin');
      } else if (data.user.role === 'BRANCH_MANAGER') {
        navigate('/dashboard/branch-manager');
      } else if (data.user.role === 'BRANCH_STAFF') {
        navigate('/dashboard/branch-staff');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Standard hook call at the top level
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
          avatar: userInfo.picture
        };

        const res = await fetch(`${API_URL}/api/auth/google-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(googleData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        login(data.user, data.token);
        navigate('/');
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

  const triggerGoogleLogin = () => {
    if (!clientId) {
      setError("Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.");
      return;
    }
    // Note: If you get redirect_uri_mismatch, ensure http://localhost:5173 
    // is added to "Authorized redirect URIs" and "Authorized JavaScript origins" 
    // in your Google Cloud Console.
    handleGoogleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-outline hover:text-primary transition-colors mb-6 ml-1 font-bold text-sm">
          <ArrowLeft className="w-4 h-4" />
          {t('back_to_home')}
        </Link>
        
        <div className="bg-surface p-8 rounded-[32px] shadow-sm border border-outline-variant">
          <h2 className="text-2xl font-black text-on-surface mb-6 text-center">{t('login_title')}</h2>
        
        {error && (
          <div className="bg-error/10 text-error p-3 rounded-xl text-xs font-bold mb-4 border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-outline uppercase tracking-widest mb-2 ml-1">{t('email_label')}</label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-xs font-black text-outline uppercase tracking-widest">{t('password_label')}</label>
              <Link to="/forgot-password" title={t('forgot_password')} className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter">
                {t('forgot_password')}
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-xl"
            />
          </div>
          
          <Button type="submit" className="w-full h-12 rounded-xl font-black mt-2 shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? t('logging_in') : t('login')}
          </Button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px bg-outline-variant flex-grow" />
          <span className="text-[10px] font-black text-outline uppercase tracking-widest">OR</span>
          <div className="h-px bg-outline-variant flex-grow" />
        </div>

        <button 
          onClick={triggerGoogleLogin}
          type="button"
          className="w-full h-12 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-low transition-all flex items-center justify-center gap-3 font-bold text-sm text-on-surface"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          {t('connect_with_google')}
        </button>

        <p className="mt-8 text-center text-sm font-medium text-outline">
          {t('dont_have_account')}{' '}
          <Link to="/register" className="text-primary hover:underline font-black">
            {t('register_here')}
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
