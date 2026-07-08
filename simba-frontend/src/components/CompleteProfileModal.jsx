import React, { useState, useMemo } from 'react';
import { MapPin, Phone, X, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Input from './Input';
import Button from './Button';
import { API_URL } from '../lib/utils';
import RWANDA from '../data/rwanda_locations.json';
import { serialiseAddresses, buildAddress } from '../lib/addresses';

const PROVINCES = Object.keys(RWANDA).sort();

const LABEL_PRESETS = ['Home', 'Office', 'Other'];

// ── reusable select ───────────────────────────────────────────────────────────
function SelectField({ label, value, onChange, options, placeholder, disabled }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-outline uppercase tracking-widest mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full h-11 rounded-xl px-3 pr-9 text-sm font-medium border appearance-none
            bg-surface border-outline-variant text-on-surface
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
            disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
const CompleteProfileModal = ({ onClose }) => {
  const { token, updateUser } = useAuth();
  const { t } = useLanguage();

  const [label, setLabel]     = useState('Home');
  const [street, setStreet]   = useState('');
  const [landmark, setLandmark] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [sector, setSector]   = useState('');
  const [phone, setPhone]     = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const districts = useMemo(
    () => (province ? Object.keys(RWANDA[province]).sort() : []),
    [province]
  );
  const sectors = useMemo(
    () => (province && district ? RWANDA[province][district] : []),
    [province, district]
  );

  const handleProvinceChange = (val) => { setProvince(val); setDistrict(''); setSector(''); };
  const handleDistrictChange = (val) => { setDistrict(val); setSector(''); };

  const RW_PHONE_REGEX = /^\+2507[2389]\d{7}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!label.trim())                         return setError('Please enter an address label (e.g. Home).');
    if (!province || !district || !sector)     return setError('Please select Province, District and Sector.');
    if (!phone.trim())                         return setError('Please enter your phone number.');
    if (!RW_PHONE_REGEX.test(phone.trim()))    return setError('Phone must be in the format +2507XXXXXXXX (e.g. +250782000000).');

    setError('');
    setLoading(true);

    // Build the first (default) address and serialise as JSON array
    const newAddr = buildAddress({ label: label.trim(), street: street.trim(), landmark: landmark.trim(), sector, district, province });
    const addressJson = serialiseAddresses([newAddr]); // index 0 → isDefault: true

    try {
      const res = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ address: addressJson, phone: phone.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save profile');

      updateUser(data.user);
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-md bg-surface rounded-t-3xl sm:rounded-3xl border border-outline-variant shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 max-h-[92vh] overflow-y-auto custom-scrollbar">

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 sticky top-0 bg-surface z-10 border-b border-outline-variant/50">
          <div>
            <h2 className="text-lg font-black text-on-surface">{t('complete_profile_title')}</h2>
            <p className="text-xs text-outline mt-1 font-medium leading-relaxed">{t('complete_profile_desc')}</p>
          </div>
          <button onClick={onClose} className="ml-4 mt-0.5 p-1.5 rounded-full text-outline hover:bg-surface-container-high transition-colors flex-shrink-0" aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* ── Address section ── */}
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-[10px] font-black text-outline uppercase tracking-widest">Default Delivery Address</p>
            <span className="ml-auto text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>
          </div>

          {/* Province */}
          <SelectField label="Province" value={province} onChange={handleProvinceChange} options={PROVINCES} placeholder="Select Province" />

          {/* District */}
          <SelectField
            label="District"
            value={district}
            onChange={handleDistrictChange}
            options={districts}
            placeholder={province ? 'Select District' : 'Select a Province first'}
            disabled={!province}
          />

          {/* Sector */}
          <SelectField
            label="Sector"
            value={sector}
            onChange={setSector}
            options={sectors}
            placeholder={district ? 'Select Sector' : 'Select a District first'}
            disabled={!district}
          />

          {/* Address Label */}
          <SelectField
            label="Address Label"
            value={label}
            onChange={setLabel}
            options={LABEL_PRESETS}
            placeholder="Select a label"
          />

          {/* House / Street */}
          <div>
            <label className="block text-[10px] font-black text-outline uppercase tracking-widest mb-1.5 ml-1">
              House / Street <span className="text-outline/50 normal-case font-medium">(optional)</span>
            </label>
            <Input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="e.g. KG 7 Ave, House No. 12"
              className="h-11 rounded-xl text-sm"
            />
          </div>

          {/* Landmarks */}
          <div>
            <label className="block text-[10px] font-black text-outline uppercase tracking-widest mb-1.5 ml-1">
              Landmarks <span className="text-outline/50 normal-case font-medium">(optional)</span>
            </label>
            <Input
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Kigali Convention Centre, blue gate"
              className="h-11 rounded-xl text-sm"
            />
            <p className="text-[10px] font-medium text-outline mt-1 ml-1">Helps our team locate you faster.</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-outline-variant/50" />

          {/* Phone */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Phone className="w-4 h-4 text-primary flex-shrink-0" />
              <label className="text-[10px] font-black text-outline uppercase tracking-widest">
                {t('phone_label') || 'Phone Number'}
              </label>
            </div>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +250 788 000 000"
              className="h-11 rounded-xl text-sm"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-[11px] font-bold text-error bg-error/10 border border-error/20 rounded-xl px-3 py-2">{error}</p>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 text-success bg-success/10 border border-success/20 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-bold">Profile updated!</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1 pb-2">
            <Button type="button" variant="ghost" className="flex-1 h-11 rounded-xl font-black text-sm border border-outline-variant" onClick={onClose}>
              {t('later') || 'Later'}
            </Button>
            <Button type="submit" className="flex-1 h-11 rounded-xl font-black text-sm" disabled={loading || success}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save') || 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileModal;
