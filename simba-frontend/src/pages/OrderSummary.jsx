import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import { API_URL, formatRwf } from '../lib/utils';
import { formatAddress } from '../lib/addresses';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Store,
  Truck,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/* ─── tiny helpers ──────────────────────────────────────────────────────── */
const Row = ({ label, value, accent }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-outline-variant/30 last:border-0">
    <span className="text-xs text-outline font-medium shrink-0">{label}</span>
    <span className={`text-sm font-bold text-right leading-snug ${accent ? 'text-primary' : 'text-on-surface'}`}>
      {value}
    </span>
  </div>
);

const SectionLabel = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 mb-3">
    <Icon className="w-4 h-4 text-primary shrink-0" />
    <span className="text-[10px] font-black uppercase tracking-widest text-outline">{children}</span>
  </div>
);

/* ─── component ─────────────────────────────────────────────────────────── */
const OrderSummary = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { clearCart } = useCart();
  const { user, token, updateUser } = useAuth();
  const { t } = useLanguage();

  const {
    fulfillmentMethod,
    phone,
    deliveryAddress,
    deliveryFee,
    deliveryFeeDistance,
    deliveryFeeFree,
    fulfillmentBranch,
    saveToProfile,
    savePhoneToProfile,
    items = [],
    totalPrice,
  } = location.state || {};

  const [loading, setLoading]       = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [itemsExpanded, setItemsExpanded] = useState(false);

  const isDelivery      = fulfillmentMethod === 'delivery';
  const isFreeDelivery  = deliveryFeeFree || deliveryFee === 0;
  const finalDeliveryFee = isFreeDelivery ? 0 : (deliveryFee ?? null);
  const grandTotal      = totalPrice + (finalDeliveryFee ?? 0);

  // Visible items: first 3, rest collapsible
  const PREVIEW_COUNT   = 3;
  const visibleItems    = itemsExpanded ? items : items.slice(0, PREVIEW_COUNT);
  const hiddenCount     = items.length - PREVIEW_COUNT;

  if (!items.length || !totalPrice) {
    navigate('/checkout');
    return null;
  }

  /* ── place order ─────────────────────────────────────────────────────── */
  const handlePlaceOrder = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      if (saveToProfile && isDelivery && deliveryAddress && user) {
        try {
          const existing = JSON.parse(user.address || '[]');
          const updated  = [...(Array.isArray(existing) ? existing : [existing].filter(Boolean)), deliveryAddress];
          await fetch(`${API_URL}/api/users/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ address: JSON.stringify(updated) }),
          });
          updateUser({ ...user, address: JSON.stringify(updated) });
        } catch { /* non-critical */ }
      }

      if (savePhoneToProfile && phone && user) {
        try {
          await fetch(`${API_URL}/api/users/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ phone }),
          });
          updateUser({ ...user, phone });
        } catch { /* non-critical */ }
      }

      const orderItems = items.map((item) => ({ productId: item.id, quantity: item.quantity }));
      const body = {
        items: orderItems,
        fulfillmentBranch: fulfillmentBranch || null,
        fulfillmentMethod,
        phone,
        ...(isDelivery && deliveryAddress ? { deliveryAddress: formatAddress(deliveryAddress) } : {}),
      };

      const res  = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place order');

      clearCart();
      navigate('/success', {
        state: {
          orderId: data.order?.id,
          fulfillmentBranch,
          fulfillmentMethod,
          deliveryAddress: isDelivery ? formatAddress(deliveryAddress) : null,
          phone,
          totalPrice,
          items,
        },
      });
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── render ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-lg mx-auto px-4 pt-5 pb-10 md:px-6 md:pt-8">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/checkout', { state: location.state })}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-outline-variant text-outline hover:bg-surface-container-high transition-all active:scale-90 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight text-on-surface leading-tight">
              Confirm Order
            </h1>
            <p className="text-[11px] text-outline font-medium mt-0.5">
              Review everything before placing
            </p>
          </div>
        </div>

        <div className="space-y-3">

          {/* ── Items card ───────────────────────────────────────────────── */}
          <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 pt-4 pb-3">
              <SectionLabel icon={ShoppingBag}>
                Items · {items.length}
              </SectionLabel>

              <div className="space-y-3">
                {visibleItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container-low shrink-0 border border-outline-variant/40">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-semibold text-on-surface leading-snug line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-outline mt-0.5">
                        {formatRwf(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-black text-primary whitespace-nowrap shrink-0">
                      {formatRwf(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Show more / less toggle */}
              {items.length > PREVIEW_COUNT && (
                <button
                  onClick={() => setItemsExpanded(v => !v)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 text-[11px] font-black text-primary uppercase tracking-widest py-2 rounded-xl hover:bg-primary/5 transition-colors active:scale-95"
                >
                  {itemsExpanded ? (
                    <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
                  ) : (
                    <><ChevronDown className="w-3.5 h-3.5" /> +{hiddenCount} more items</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ── Fulfillment card ─────────────────────────────────────────── */}
          <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 pt-4 pb-3">
              <SectionLabel icon={isDelivery ? Truck : Store}>
                {isDelivery ? 'Delivery Details' : 'Pickup Details'}
              </SectionLabel>

              <div>
                <Row label="Method" value={isDelivery ? 'Home Delivery' : 'Branch Pickup'} />

                {fulfillmentBranch && (
                  <Row
                    label={isDelivery ? 'Fulfilled from' : 'Pickup at'}
                    value={fulfillmentBranch}
                  />
                )}

                {isDelivery && deliveryAddress && (
                  <Row
                    label={
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Address
                      </span>
                    }
                    value={
                      <span className="flex flex-col items-end gap-0.5">
                        {deliveryAddress.label && (
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                            {deliveryAddress.label}
                          </span>
                        )}
                        {formatAddress(deliveryAddress)}
                      </span>
                    }
                  />
                )}

                <Row
                  label={
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Contact
                    </span>
                  }
                  value={phone}
                />

                <Row
                  label={
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Payment
                    </span>
                  }
                  value={isDelivery ? 'Pay on Delivery' : 'Pay at Pickup'}
                />
              </div>

              {/* Save notices */}
              {(saveToProfile || savePhoneToProfile) && (
                <div className="mt-3 pt-3 border-t border-outline-variant/40 flex flex-col gap-1.5">
                  {saveToProfile && (
                    <div className="flex items-center gap-2 text-[11px] text-outline font-medium">
                      <BookmarkPlus className="w-3 h-3 text-primary shrink-0" />
                      Address will be saved to your profile
                    </div>
                  )}
                  {savePhoneToProfile && (
                    <div className="flex items-center gap-2 text-[11px] text-outline font-medium">
                      <BookmarkPlus className="w-3 h-3 text-primary shrink-0" />
                      Phone number will be saved to your profile
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Price card ───────────────────────────────────────────────── */}
          <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 pt-4 pb-4">
              <SectionLabel icon={CreditCard}>Price Breakdown</SectionLabel>

              <Row
                label={`Subtotal · ${items.length} ${items.length === 1 ? 'item' : 'items'}`}
                value={formatRwf(totalPrice)}
              />

              <Row
                label="Delivery fee"
                value={
                  isFreeDelivery
                    ? '🎉 Free!'
                    : finalDeliveryFee != null
                      ? `${formatRwf(finalDeliveryFee)}${deliveryFeeDistance ? ` · ${deliveryFeeDistance} km` : ''}`
                      : <span className="italic text-xs text-outline">Confirmed at delivery</span>
                }
                accent={isFreeDelivery}
              />

              {/* Grand total */}
              <div className="flex items-center justify-between pt-3 mt-1 border-t border-outline-variant/50">
                <span className="text-base font-black text-on-surface tracking-tight">Total</span>
                <span className="text-2xl font-black text-primary tracking-tight leading-none">
                  {formatRwf(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Error ────────────────────────────────────────────────────── */}
          {errorMessage && (
            <div className="p-4 bg-error/5 border border-error/20 rounded-2xl flex items-start gap-3 text-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold">{errorMessage}</p>
            </div>
          )}

          {/* ── CTA ──────────────────────────────────────────────────────── */}
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-primary text-on-primary font-black text-base tracking-wide shadow-lg shadow-primary/30 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] hover:bg-primary-container disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Placing order…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {t('place_order')}
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-outline uppercase tracking-widest font-semibold pb-2">
            {t('secure_checkout_badge')}
          </p>

        </div>
      </main>
    </div>
  );
};

export default OrderSummary;
