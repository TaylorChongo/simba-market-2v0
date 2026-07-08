import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Input from '../components/Input';
import AddrForm from '../components/AddrForm';
import { API_URL, MINIMUM_ORDER_AMOUNT, FREE_DELIVERY_THRESHOLD, formatRwf, findClosestBranch } from '../lib/utils';
import { parseAddresses, formatAddress } from '../lib/addresses';
import { calcDeliveryFee, resolveSectorCoords } from '../lib/deliveryFee';
import RWANDA from '../data/rwanda_locations.json';
import { 
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Store,
  Phone,
  Truck,
  ChevronDown,
  MapPin,
  PlusCircle,
  BookmarkPlus,
} from 'lucide-react';

const PROVINCES = Object.keys(RWANDA).sort();

const Checkout = () => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user, token, updateUser } = useAuth();
  const { selectedBranch, toggleMap, branches } = useBranch();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [fulfillmentMethod, setFulfillmentMethod] = useState('delivery');
  const [phone, setPhone] = useState(user?.phone || '');

  // Saved addresses from the user's profile
  const savedAddresses = parseAddresses(user?.address);
  const defaultAddress = savedAddresses.find(a => a.isDefault) ?? savedAddresses[0] ?? null;

  // Selected delivery address (-1 means "enter a new one")
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(defaultAddress ? 0 : -1);

  // Custom address form state (mirrors AddrForm in profile)
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrProvince, setAddrProvince] = useState('');
  const [addrDistrict, setAddrDistrict] = useState('');
  const [addrSector, setAddrSector] = useState('');
  const addrDistricts = useMemo(() => (addrProvince ? Object.keys(RWANDA[addrProvince]).sort() : []), [addrProvince]);
  const addrSectors = useMemo(() => (addrProvince && addrDistrict ? RWANDA[addrProvince][addrDistrict] : []), [addrProvince, addrDistrict]);
  const [addrError, setAddrError] = useState('');
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savePhoneToProfile, setSavePhoneToProfile] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(''); // 'creating', 'initiating', 'polling', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false);

  // Restore form state saved before login redirect
  useEffect(() => {
    const saved = sessionStorage.getItem('simba_checkout_state');
    if (saved && user) {
      try {
        const { fulfillmentMethod: fm, phone: ph, selectedAddressIdx: sai, customAddress: ca } = JSON.parse(saved);
        sessionStorage.removeItem('simba_checkout_state');
        setFulfillmentMethod(fm || 'delivery');
        setPhone(ph || '');
        if (sai !== undefined) setSelectedAddressIdx(sai);
        if (ca) {
          setAddrLabel(ca.label || 'Home');
          setAddrStreet(ca.street || '');
          setAddrLandmark(ca.landmark || '');
          setAddrProvince(ca.province || '');
          setAddrDistrict(ca.district || '');
          setAddrSector(ca.sector || '');
        }
        setShouldAutoSubmit(true);
      } catch { sessionStorage.removeItem('simba_checkout_state'); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  const totalPrice = getTotalPrice();
  const PICKUP_DEPOSIT_AMOUNT = 500;
  const remainingMinimum = Math.max(MINIMUM_ORDER_AMOUNT - totalPrice, 0);
  const isBelowMinimum = totalPrice < MINIMUM_ORDER_AMOUNT;
  const isFreeDelivery = totalPrice >= FREE_DELIVERY_THRESHOLD;

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && status !== 'success') {
      navigate('/cart');
    }
  }, [cart, navigate, status]);

  const RW_PHONE_REGEX = /^\+2507[2389]\d{7}$/;

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    setPhoneError(val && !RW_PHONE_REGEX.test(val) ? t('invalid_phone') : '');
  };

  const handleNext = (e) => {
    e?.preventDefault();
    if (isBelowMinimum) {
      setErrorMessage(t('minimum_order_error').replace('{amount}', formatRwf(MINIMUM_ORDER_AMOUNT)));
      return;
    }

    if (!user) {
      sessionStorage.setItem('simba_checkout_state', JSON.stringify({
        fulfillmentMethod, phone, selectedAddressIdx,
        customAddress: { label: addrLabel, street: addrStreet, landmark: addrLandmark, province: addrProvince, district: addrDistrict, sector: addrSector }
      }));
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    const builtCustomAddress = { label: addrLabel, street: addrStreet, landmark: addrLandmark, province: addrProvince, district: addrDistrict, sector: addrSector };
    const deliveryAddress = isDelivery
      ? (selectedAddressIdx >= 0 ? savedAddresses[selectedAddressIdx] : builtCustomAddress)
      : null;

    setErrorMessage('');
    navigate('/order-summary', {
      state: {
        fulfillmentMethod,
        phone,
        deliveryAddress,
        deliveryFee: deliveryFeeResult?.fee ?? null,
        deliveryFeeDistance: deliveryFeeResult?.distance ?? null,
        deliveryFeeFree: deliveryFeeResult?.isFree ?? false,
        fulfillmentBranch: resolvedFulfillmentBranch,
        saveToProfile,
        savePhoneToProfile,
        items: cart,
        totalPrice,
      }
    });
  };

  // Restore and auto-advance after login redirect
  useEffect(() => {
    if (shouldAutoSubmit && phone && fulfillmentMethod) {
      setShouldAutoSubmit(false);
      handleNext();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoSubmit, phone, fulfillmentMethod]);

  const isDelivery = fulfillmentMethod === 'delivery';
  const activeAddress = isDelivery
    ? (selectedAddressIdx >= 0 ? savedAddresses[selectedAddressIdx] : { sector: addrSector, street: addrStreet })
    : null;
  // A saved address (idx >= 0) is always trusted as valid; a new custom address needs at least a sector or street
  const hasValidAddress = !isDelivery || (selectedAddressIdx >= 0 ? !!savedAddresses[selectedAddressIdx] : !!(addrSector || addrStreet));
  const isFormComplete = hasValidAddress && (isDelivery || selectedBranch) && RW_PHONE_REGEX.test(phone) && !isBelowMinimum;

  // ── Delivery fee calculation ─────────────────────────────────────────────
  const deliveryFeeResult = useMemo(() => {
    if (!isDelivery) return null;

    const sector   = activeAddress?.sector   || '';
    const district = activeAddress?.district || '';

    if (!sector && !district) return null; // no address yet

    // Determine which branch to route from:
    // 1. User's explicitly selected branch (from the branch map)
    // 2. Closest branch to the delivery address (straight-line)
    let sourceBranchName = selectedBranch || null;

    if (!sourceBranchName && sector) {
      const destCoords = resolveSectorCoords(sector, district);
      if (destCoords) {
        const closest = findClosestBranch(branches, destCoords.lat, destCoords.lng);
        sourceBranchName = closest?.name || null;
      }
    }

    if (!sourceBranchName) return null;

    return calcDeliveryFee(sourceBranchName, sector, district, totalPrice, FREE_DELIVERY_THRESHOLD);
  }, [isDelivery, activeAddress, selectedBranch, totalPrice, branches]);

  // ── Fulfillment branch resolution ────────────────────────────────────────
  // For delivery: closest branch to the delivery address (overrides manual selection
  // so the order is always fulfilled from the most sensible location).
  // For pickup: the user's manually selected branch.
  const resolvedFulfillmentBranch = useMemo(() => {
    if (!isDelivery) return selectedBranch || null;

    const sector   = activeAddress?.sector   || '';
    const district = activeAddress?.district || '';
    if (!sector && !district) return selectedBranch || null;

    const destCoords = resolveSectorCoords(sector, district);
    if (!destCoords) return selectedBranch || null;

    const closest = findClosestBranch(branches, destCoords.lat, destCoords.lng);
    return closest?.name || selectedBranch || null;
  }, [isDelivery, activeAddress, selectedBranch, branches]);

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8 md:px-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/cart">
            <Button variant="ghost" className="p-2 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="type-title">{t('secure_checkout')}</h1>
            <p className="type-caption mt-0.5">Fill in your delivery details</p>
          </div>
        </div>


        <div className="max-w-2xl mx-auto w-full">
          {/* Single form card */}
          <div className="lg:col-span-7">
            <section className="bg-surface border border-outline-variant rounded-[28px] md:rounded-[40px] p-5 md:p-8 shadow-sm space-y-6">

              {/* Fulfillment Method */}
              <div>
                <label className="type-label block mb-2">
                  {t('fulfillment_method')}
                </label>
                <div className="relative">
                  <select
                    value={fulfillmentMethod}
                    onChange={(e) => setFulfillmentMethod(e.target.value)}
                    aria-label={t('fulfillment_method')}
                    className="w-full h-12 rounded-2xl bg-surface-container-low border border-outline-variant pl-11 pr-10 text-sm font-bold text-on-surface appearance-none focus:outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="delivery">{t('delivery_option')}</option>
                    <option value="pickup">{t('pickup_option')}</option>
                  </select>
                  <Truck className="w-4 h-4 text-primary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <ChevronDown className="w-4 h-4 text-outline absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-xs text-outline font-medium mt-1.5 leading-relaxed">
                  {isDelivery ? t('delivery_option_desc') : t('pickup_option_desc')}
                </p>
              </div>

              <div className="h-px bg-outline-variant" />

              {/* Delivery Address — only for delivery */}
              {isDelivery && (
                <>
                  <div>
                    <label className="type-label block mb-3">
                      Delivery Address
                    </label>

                    <div className="space-y-2">
                      {/* Saved addresses */}
                      {savedAddresses.map((addr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedAddressIdx(idx)}
                          className={`w-full text-left rounded-2xl border px-4 py-3 transition-all flex items-start gap-3 ${
                            selectedAddressIdx === idx
                              ? 'border-primary bg-primary/5'
                              : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            selectedAddressIdx === idx ? 'border-primary bg-primary' : 'border-outline'
                          }`}>
                            {selectedAddressIdx === idx && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-black text-on-surface">{addr.label || 'Address'}</p>
                              {addr.isDefault && (
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-1.5 py-0.5 rounded-full">Default</span>
                              )}
                            </div>
                            <p className="text-xs text-outline font-medium mt-0.5 leading-relaxed">
                              {formatAddress(addr) || <span className="italic">No details saved</span>}
                            </p>
                          </div>
                          <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${selectedAddressIdx === idx ? 'text-primary' : 'text-outline'}`} />
                        </button>
                      ))}

                      {/* Enter a different address */}
                      <button
                        type="button"
                        onClick={() => setSelectedAddressIdx(-1)}
                        className={`w-full text-left rounded-2xl border px-4 py-3 transition-all flex items-center gap-3 ${
                          selectedAddressIdx === -1
                            ? 'border-primary bg-primary/5'
                            : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selectedAddressIdx === -1 ? 'border-primary bg-primary' : 'border-outline'
                        }`}>
                          {selectedAddressIdx === -1 && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <PlusCircle className={`w-4 h-4 shrink-0 ${selectedAddressIdx === -1 ? 'text-primary' : 'text-outline'}`} />
                        <span className="text-sm font-bold text-outline">Enter a different address</span>
                      </button>

                      {/* Custom address form */}
                      {selectedAddressIdx === -1 && (
                        <div className="pt-2 space-y-3">
                          <AddrForm
                            addrProvinces={PROVINCES}
                            addrLabel={addrLabel} setAddrLabel={setAddrLabel}
                            addrStreet={addrStreet} setAddrStreet={setAddrStreet}
                            addrLandmark={addrLandmark} setAddrLandmark={setAddrLandmark}
                            addrProvince={addrProvince} setAddrProvince={(p) => { setAddrProvince(p); setAddrDistrict(''); setAddrSector(''); }}
                            addrDistrict={addrDistrict} setAddrDistrict={(d) => { setAddrDistrict(d); setAddrSector(''); }}
                            addrSector={addrSector} setAddrSector={setAddrSector}
                            addrDistricts={addrDistricts} addrSectors={addrSectors}
                            error={addrError}
                          />

                          {/* Save to profile toggle — only show for logged-in users */}
                          {user && (
                            <button
                              type="button"
                              onClick={() => setSaveToProfile(v => !v)}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                                saveToProfile
                                  ? 'border-primary bg-primary/5'
                                  : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                saveToProfile ? 'border-primary bg-primary' : 'border-outline'
                              }`}>
                                {saveToProfile && <span className="text-white text-[8px] font-black leading-none">✓</span>}
                              </div>
                              <BookmarkPlus className={`w-4 h-4 shrink-0 ${saveToProfile ? 'text-primary' : 'text-outline'}`} />
                              <span className="text-sm font-bold text-on-surface">Save this address to my profile</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-px bg-outline-variant" />
                </>
              )}

              {/* Pickup Branch — only for pickup */}
              {!isDelivery && (
                <>
                  <div>
                    <label className="type-label block mb-2">
                      {t('select_fulfillment_branch')}
                    </label>
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface-container-low border border-outline-variant rounded-2xl">
                      <div className="flex items-center gap-2 min-w-0">
                        <Store className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm font-bold truncate">{selectedBranch || t('choose_branch')}</span>
                      </div>
                      <Button
                        variant="outline"
                        onClick={toggleMap}
                        className="h-9 rounded-xl px-3 text-[10px] font-black uppercase tracking-widest shrink-0"
                      >
                        {selectedBranch ? t('change_branch') : t('select_branch')}
                      </Button>
                    </div>
                  </div>
                  <div className="h-px bg-outline-variant" />
                </>
              )}

              {/* Contact Number */}
              <div>
                <label className="type-label block mb-3">
                  {t('contact_number')}
                </label>

                {user?.phone ? (
                  <div className="space-y-2">
                    {/* Profile number option */}
                    <button
                      type="button"
                      onClick={() => { setPhone(user.phone); setPhoneError(''); }}
                      className={`w-full text-left rounded-2xl border px-4 py-3 transition-all flex items-center gap-3 ${
                        phone === user.phone
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        phone === user.phone ? 'border-primary bg-primary' : 'border-outline'
                      }`}>
                        {phone === user.phone && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-on-surface">{user.phone}</p>
                        <p className="text-[10px] text-outline font-bold uppercase tracking-widest mt-0.5">Profile number</p>
                      </div>
                      {phone === user.phone && (
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest shrink-0">Default</span>
                      )}
                    </button>

                    {/* Different number option */}
                    <button
                      type="button"
                      onClick={() => { setPhone(''); setPhoneError(''); }}
                      className={`w-full text-left rounded-2xl border px-4 py-3 transition-all flex items-center gap-3 ${
                        phone !== user.phone
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        phone !== user.phone ? 'border-primary bg-primary' : 'border-outline'
                      }`}>
                        {phone !== user.phone && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm font-bold text-outline">Use a different number</span>
                    </button>

                    {/* Input + save toggle shown when "different number" is selected */}
                    {phone !== user.phone && (
                      <div className="space-y-2 mt-1">
                        <div className="relative">
                          <Phone className="w-4 h-4 text-primary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <Input
                            type="tel"
                            placeholder="+250 78X XXX XXX"
                            value={phone}
                            onChange={handlePhoneChange}
                            className="h-12 rounded-2xl text-sm font-bold pl-11"
                            autoFocus
                          />
                        </div>

                        {/* Save to profile toggle — only when number is valid */}
                        {user && RW_PHONE_REGEX.test(phone) && (
                          <button
                            type="button"
                            onClick={() => setSavePhoneToProfile(v => !v)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                              savePhoneToProfile
                                ? 'border-primary bg-primary/5'
                                : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                              savePhoneToProfile ? 'border-primary bg-primary' : 'border-outline'
                            }`}>
                              {savePhoneToProfile && <span className="text-white text-[8px] font-black leading-none">✓</span>}
                            </div>
                            <BookmarkPlus className={`w-4 h-4 shrink-0 ${savePhoneToProfile ? 'text-primary' : 'text-outline'}`} />
                            <span className="text-sm font-bold text-on-surface">Save this number to my profile</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* No profile phone — show input directly */
                  <div className="relative">
                    <Phone className="w-4 h-4 text-primary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type="tel"
                      placeholder="+250 78X XXX XXX"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="h-12 rounded-2xl text-sm font-bold pl-11"
                    />
                  </div>
                )}

                {phoneError && (
                  <p className="text-xs font-bold text-error flex items-center gap-1 mt-2 ml-1">
                    <AlertCircle className="w-3 h-3" /> {phoneError}
                  </p>
                )}
              </div>

            </section>

            {/* Bottom action bar */}
            <div className="mt-6 space-y-3">
              {isBelowMinimum && (
                <div className="p-4 bg-error/5 border border-error/10 rounded-2xl flex items-start gap-3 text-error">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-black">
                      {t('minimum_order_title').replace('{amount}', formatRwf(MINIMUM_ORDER_AMOUNT))}
                    </p>
                    <p className="text-[11px] font-bold text-on-surface mt-1 leading-tight">
                      {t('minimum_order_desc').replace('{remaining}', formatRwf(remainingMinimum))}
                    </p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 bg-error/5 border border-error/10 rounded-2xl flex items-center gap-3 text-error">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-xs font-bold">{errorMessage}</p>
                </div>
              )}

              <Button
                onClick={handleNext}
                className="w-full py-4 h-auto type-cta rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                disabled={!isFormComplete}
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </Button>

              <p className="type-label text-center mt-1">
                {t('secure_delivery_badge')}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
