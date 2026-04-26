import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { API_URL } from '../lib/utils';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(t('reset_link_sent'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest p-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-outline hover:text-primary transition-colors mb-6 ml-1 font-bold text-sm">
          <ArrowLeft className="w-4 h-4" />
          {t('back_to_login')}
        </Link>

        <div className="bg-surface p-8 rounded-[32px] shadow-sm border border-outline-variant">
          <h2 className="text-2xl font-black text-on-surface mb-2">{t('forgot_password')}</h2>
          <p className="text-sm text-outline mb-8">Enter your email address and we'll send you a link to reset your password.</p>

          {message ? (
            <div className="bg-success/5 border border-success/10 p-6 rounded-2xl text-center">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <p className="text-sm font-bold text-success mb-2">{message}</p>
              <p className="text-xs text-outline">Check your server logs for the simulated link.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-error/10 text-error p-3 rounded-xl text-xs font-bold border border-error/20">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-black text-outline uppercase tracking-widest mb-2 ml-1">{t('email_label')}</label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-11 h-12 rounded-xl"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl font-black mt-2" disabled={loading}>
                {loading ? '...' : t('send_reset_link')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
