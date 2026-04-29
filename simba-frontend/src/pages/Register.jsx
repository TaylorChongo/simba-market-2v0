import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../lib/utils';
import Input from '../components/Input';
import Button from '../components/Button';
import { ArrowLeft, ChevronDown } from 'lucide-react';

import GoogleLoginButton from '../components/GoogleLoginButton';

const Register = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLIENT',
    branch: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const locations = [
    "Simba Supermarket Remera",
    "Simba Supermarket Kimironko",
    "Simba Supermarket Kacyiru",
    "Simba Supermarket Nyamirambo",
    "Simba Supermarket Gikondo",
    "Simba Supermarket Kanombe",
    "Simba Supermarket Kinyinya",
    "Simba Supermarket Kibagabaga",
    "Simba Supermarket Nyanza"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if ((formData.role === 'BRANCH_MANAGER' || formData.role === 'BRANCH_STAFF') && !formData.branch) {
      setError('Please select a branch');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      navigate('/login');
    } catch (err) {
      console.error('Registration error details:', err);
      setError(err.message === 'Failed to fetch' 
        ? `Cannot connect to the server. Please ensure the backend is running on ${API_URL}` 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-outline hover:text-primary transition-colors mb-6 ml-1 font-bold text-sm">
          <ArrowLeft className="w-4 h-4" />
          {t('back_to_home')}
        </Link>

        <div className="bg-surface p-8 rounded-[32px] shadow-sm border border-outline-variant">
          <h2 className="text-2xl font-black text-on-surface mb-6 text-center">{t('register_title')}</h2>

        {error && (
          <div className="bg-error/10 text-error p-3 rounded-xl text-xs font-bold mb-4 border border-error/20 flex items-center gap-2">
            <span className="w-1 h-1 bg-error rounded-full" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-outline uppercase tracking-widest mb-2 ml-1">{t('full_name_label')}</label>
            <Input
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              className="h-12 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-outline uppercase tracking-widest mb-2 ml-1">{t('email_label')}</label>
            <Input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="h-12 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-outline uppercase tracking-widest mb-2 ml-1">{t('password_label')}</label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="h-12 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-outline uppercase tracking-widest mb-2 ml-1">{t('account_type_label')}</label>
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none"
              >
                <option value="CLIENT">{t('client_role')}</option>
                <option value="BRANCH_MANAGER">{t('manager_role')}</option>
                <option value="BRANCH_STAFF">{t('staff_role')}</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
            </div>
          </div>

          {(formData.role === 'BRANCH_MANAGER' || formData.role === 'BRANCH_STAFF') && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-black text-outline uppercase tracking-widest mb-2 ml-1">{t('assigned_branch_label')}</label>
              <div className="relative">
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none"
                  required
                >
                  <option value="">{t('select_branch_placeholder')}</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full h-12 rounded-xl mt-4 font-black" disabled={loading}>
            {loading ? t('creating_account') : t('sign_up')}
          </Button>
        </form>

        {clientId && (
          <>
            <div className="my-8 flex items-center gap-4">
              <div className="h-px bg-outline-variant flex-grow" />
              <span className="text-[10px] font-black text-outline uppercase tracking-widest">OR</span>
              <div className="h-px bg-outline-variant flex-grow" />
            </div>

            <GoogleLoginButton setLoading={setLoading} setError={setError} />
          </>
        )}

        <p className="mt-8 text-center text-sm font-medium text-outline">
          {t('already_have_account')}{' '}
          <Link to="/login" className="text-primary hover:underline font-black">
            {t('login_here')}
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
