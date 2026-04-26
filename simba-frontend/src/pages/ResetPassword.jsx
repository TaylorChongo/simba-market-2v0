import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../lib/utils';
import Input from '../components/Input';
import Button from '../components/Button';
import { ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface p-8 rounded-[32px] shadow-sm border border-outline-variant">
          <h2 className="text-2xl font-black text-on-surface mb-2">{t('reset_password_title')}</h2>
          <p className="text-sm text-outline mb-8">Enter your new password below to regain access to your account.</p>

          {success ? (
            <div className="bg-success/5 border border-success/10 p-6 rounded-2xl text-center">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <p className="text-sm font-bold text-success mb-2">{t('password_updated')}</p>
              <p className="text-xs text-outline">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-error/10 text-error p-3 rounded-xl text-xs font-bold border border-error/20">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-black text-outline uppercase tracking-widest mb-2 ml-1">{t('new_password_label')}</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pl-11 h-12 rounded-xl"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-outline uppercase tracking-widest mb-2 ml-1">{t('confirm_password_label')}</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-11 h-12 rounded-xl"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl font-black mt-2" disabled={loading}>
                {loading ? '...' : t('update_password')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
