import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useBranch } from '../context/BranchContext';
import { API_URL } from '../lib/utils';
import Input from '../components/Input';
import Button from '../components/Button';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

import GoogleLoginButton from '../components/GoogleLoginButton';

const Login = () => {
  const { login } = useAuth();
  const { autoSelectNearestBranch } = useBranch();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const rawFrom = location.state?.from;
  // Only honour the redirect if the user was mid-checkout; all other origins go home
  const from = rawFrom === '/checkout' ? '/checkout' : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Handles traditional email/password login
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
      autoSelectNearestBranch(data.user.address);
      
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
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest px-4 py-6 pb-24 md:pb-6">
      <div className="w-full max-w-md">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-outline hover:text-primary transition-colors mb-4 font-bold text-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back_to_home')}
        </Link>
        
        <div className="bg-surface px-5 py-6 md:p-8 rounded-3xl shadow-xl border border-outline-variant">
          <h2 className="type-title text-center mb-1">{t('login_title')}</h2>
          <p className="type-caption text-center mb-5">Welcome back to Simba Market</p>
        
          {error && (
            <div className="bg-error/10 text-error p-3 rounded-xl text-xs font-semibold mb-4 border border-error/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="type-label block mb-1.5 ml-1">
                {t('email_label')}
              </label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl text-sm"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="type-label block">
                  {t('password_label')}
                </label>
                <Link 
                  to="/forgot-password" 
                  title={t('forgot_password')} 
                  className="text-[11px] font-semibold text-primary hover:underline active:scale-95"
                >
                  {t('forgot_password')}
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl pr-11 text-sm"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors active:scale-90 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 rounded-xl type-cta mt-1 shadow-lg shadow-primary/20 active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? t('logging_in') : t('login')}
            </Button>
          </form>

          {clientId && (
            <>
              <div className="my-6 flex items-center gap-3">
                <div className="h-px bg-outline-variant flex-grow" />
                <span className="type-label">OR</span>
                <div className="h-px bg-outline-variant flex-grow" />
              </div>

              <GoogleLoginButton setLoading={setLoading} setError={setError} from={from} />
            </>
          )}

          <p className="mt-6 text-center type-caption">
            {t('dont_have_account')}{' '}
            <Link to="/register" className="text-primary hover:underline font-bold">
              {t('register_here')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
