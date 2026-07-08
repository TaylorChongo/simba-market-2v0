import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { MINIMUM_ORDER_AMOUNT, FREE_DELIVERY_THRESHOLD, formatRwf, shortName } from '../lib/utils';
import { getDefaultAddress } from '../lib/addresses';
import { calcDeliveryFee } from '../lib/deliveryFee';
import {
  Trash2, Plus, Minus, ArrowLeft, ShoppingBag,
  Bookmark,
  ChevronRight, Store,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const {
    cart, removeFromCart, increaseQuantity, decreaseQuantity,
    getTotalPrice, clearCart, savedItems, saveForLater, moveToCart, removeFromSaved,
  } = useCart();
  const { t } = useLanguage();
  const { selectedBranch, toggleMap } = useBranch();
  const { user } = useAuth();

  const totalPrice = getTotalPrice();
  const remainingMinimum = Math.max(MINIMUM_ORDER_AMOUNT - totalPrice, 0);
  const isBelowMinimum = totalPrice < MINIMUM_ORDER_AMOUNT;
  const isFreeDelivery = totalPrice >= FREE_DELIVERY_THRESHOLD;
  const remainingFreeDelivery = Math.max(FREE_DELIVERY_THRESHOLD - totalPrice, 0);
  const isCheckoutBlocked = isBelowMinimum;

  // Delivery fee estimate — derived from user's default address sector + selected branch
  const defaultAddr = getDefaultAddress(user?.address);
  const deliveryResult = calcDeliveryFee(
    selectedBranch,
    defaultAddr?.sector,
    defaultAddr?.district,
    totalPrice,
    FREE_DELIVERY_THRESHOLD,
  );

  /* ── Empty state ────────────────────────────────────────────────────── */
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="w-28 h-28 bg-surface-container-low border border-outline-variant rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-14 h-14 text-outline/40" />
          </div>
          <h2 className="text-2xl font-black mb-2">{t('empty_cart')}</h2>
          <p className="text-outline font-medium mb-8 max-w-xs leading-relaxed">
            {t('empty_cart_desc')}
          </p>
          <Link to="/">
            <Button className="px-10 h-12 text-base font-black rounded-2xl">
              {t('go_to_shop') || 'Go to Shop'}
            </Button>
          </Link>

          {/* Saved for later even when cart is empty */}
          {savedItems.length > 0 && (
            <div className="mt-12 w-full max-w-md text-left">
              <h3 className="text-sm font-black uppercase tracking-widest text-outline mb-3 flex items-center gap-2">
                <Bookmark className="w-4 h-4" /> Saved for Later
              </h3>
              <div className="space-y-3">
                {savedItems.map(item => (
                  <SavedItem key={item.id} item={item} moveToCart={moveToCart} removeFromSaved={removeFromSaved} />
                ))}
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-7xl mx-auto px-0 md:px-8 pb-8 md:pb-12">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 md:px-0 pt-6 pb-4 md:pt-8 md:pb-6">
          <div className="flex items-center gap-3">
            <Link to="/">
              <button className="w-9 h-9 rounded-full flex items-center justify-center border border-outline-variant text-outline hover:bg-surface-container-high transition-all active:scale-90">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div>
              <h1 className="type-title leading-none">{t('your_cart')}</h1>
              <p className="type-label mt-0.5">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Branch pill — visible on all sizes */}
            <button
              onClick={toggleMap}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-full border text-xs font-black transition-all active:scale-95 ${
                selectedBranch
                  ? 'border-primary/30 bg-primary/8 text-primary'
                  : 'border-outline-variant text-outline hover:border-primary hover:text-primary'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{selectedBranch ? shortName(selectedBranch) : t('select_branch')}</span>
              <span className="sm:hidden">{selectedBranch ? shortName(selectedBranch) : 'Branch'}</span>
            </button>

            {/* Clear cart */}
            <button
              onClick={clearCart}
              className="w-9 h-9 rounded-full border border-error/20 text-error hover:bg-error/10 flex items-center justify-center transition-all active:scale-90"
              title="Clear cart"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Dual-threshold progress bar (mobile) ────────────────────── */}
        <div className="md:hidden px-4 mb-4">
          <OrderThresholdBar
            totalPrice={totalPrice}
            isBelowMinimum={isBelowMinimum}
            isFreeDelivery={isFreeDelivery}
            remainingMinimum={remainingMinimum}
            remainingFreeDelivery={remainingFreeDelivery}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-8 px-4 md:px-0">

          {/* ── Left: Cart Items + Saved ─────────────────────────────── */}
          <div className="lg:col-span-2">

            {/* Cart items */}
            <div className="space-y-3">
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                  onRemove={removeFromCart}
                  onSave={saveForLater}
                />
              ))}
            </div>

            {/* ── Proceed to Checkout — right below items (mobile + tablet) ── */}
            <div className="lg:hidden mt-4 space-y-3">
              {/* Price summary */}
              <DeliveryFeeSummary
                totalPrice={totalPrice}
                isFreeDelivery={isFreeDelivery}
                deliveryResult={deliveryResult}
                defaultAddr={defaultAddr}
                t={t}
              />

              {/* CTA */}
              <Link to="/checkout" className={`block w-full ${isCheckoutBlocked ? 'pointer-events-none' : ''}`}>
                <button
                  disabled={isCheckoutBlocked}
                  className={`w-full h-14 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    isCheckoutBlocked
                      ? 'bg-surface-container-high text-outline cursor-not-allowed'
                      : 'bg-primary text-on-primary shadow-lg shadow-primary/25'
                  }`}
                >
                  {t('proceed_to_checkout')}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </Link>
              <p className="text-[10px] text-center text-outline uppercase tracking-widest font-bold">
                {t('secure_checkout_badge')}
              </p>
            </div>

            {/* Saved for later */}
            {savedItems.length > 0 && (
              <div className="mt-6">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3 flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5" /> Saved for Later ({savedItems.length})
                </h2>

                {/* Horizontal scroll on mobile, vertical on desktop */}
                <div className="flex md:flex-col gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                  {savedItems.map(item => (
                    <SavedItem
                      key={item.id}
                      item={item}
                      moveToCart={moveToCart}
                      removeFromSaved={removeFromSaved}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Desktop Summary Sidebar ──────────────────────── */}
          <div className="hidden lg:block lg:col-span-1">
            <OrderSummary
              totalPrice={totalPrice}
              isBelowMinimum={isBelowMinimum}
              isFreeDelivery={isFreeDelivery}
              remainingMinimum={remainingMinimum}
              remainingFreeDelivery={remainingFreeDelivery}
              deliveryResult={deliveryResult}
              defaultAddr={defaultAddr}
              isCheckoutBlocked={isCheckoutBlocked}
              t={t}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

/* ── Unified order progress bar ─────────────────────────────────────────── */
const OrderThresholdBar = ({
  totalPrice, isBelowMinimum, isFreeDelivery,
  remainingMinimum, remainingFreeDelivery,
}) => {
  // pct: 0 → 1 mapped over the full FREE_DELIVERY_THRESHOLD range
  const pct = Math.min(totalPrice / FREE_DELIVERY_THRESHOLD, 1);

  // Below 60k: red(220,38,38) → yellow(234,179,8) — warm gradient, never green
  // At 60k exactly: green(52,211,153)
  let r, g, b;
  if (pct < 1) {
    const t = pct; // 0 → <1
    r = Math.round(220 + (234 - 220) * t);
    g = Math.round(38  + (179 - 38)  * t);
    b = Math.round(38  + (8   - 38)  * t);
  } else {
    r = 21; g = 128; b = 61; // #15803d — project success green
  }
  const color = `rgb(${r},${g},${b})`;

  const label = isBelowMinimum
    ? `Add ${formatRwf(remainingMinimum)} more to reach the minimum order`
    : isFreeDelivery
      ? '🎉 Free delivery unlocked!'
      : `Add ${formatRwf(remainingFreeDelivery)} more for free delivery`;

  return (
    <div className="bg-surface border border-outline-variant rounded-2xl px-3 py-2.5 space-y-1.5">
      {/* Single bar */}
      <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.max(pct * 100, pct > 0 ? 3 : 0)}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {/* Label */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-black" style={{ color }}>{label}</p>
        <p className="text-[10px] font-black text-outline shrink-0">{formatRwf(totalPrice)}</p>
      </div>
    </div>
  );
};

/* ── Cart Item Card ─────────────────────────────────────────────────────── */
const CartItem = ({ item, onIncrease, onDecrease, onRemove, onSave }) => (
  <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden flex gap-0 active:scale-[0.995] transition-transform">
    {/* Product image */}
    <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 bg-surface-container-low">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>

    {/* Content */}
    <div className="flex-grow min-w-0 p-3 flex flex-col justify-between">
      {/* Top row: name + price */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-sm leading-tight line-clamp-2 flex-grow">{item.name}</h3>
        <p className="font-black text-sm text-primary whitespace-nowrap shrink-0">
          {formatRwf(item.price * item.quantity)}
        </p>
      </div>

      {/* Bottom row: qty controls + actions */}
      <div className="flex items-center justify-between gap-2 mt-2">
        {/* Quantity stepper */}
        <div className="flex items-center h-8 rounded-xl border border-outline-variant overflow-hidden">
          <button
            onClick={() => onDecrease(item.id)}
            className="w-8 h-8 flex items-center justify-center text-outline hover:bg-surface-container-high active:bg-surface-container-highest transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-black select-none">{item.quantity}</span>
          <button
            onClick={() => onIncrease(item.id)}
            className="w-8 h-8 flex items-center justify-center text-outline hover:bg-surface-container-high active:bg-surface-container-highest transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Unit price hint */}
        <span className="text-[10px] text-outline font-medium hidden sm:inline">
          {formatRwf(item.price)} each
        </span>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSave(item.id)}
            title="Save for later"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-outline hover:text-primary hover:bg-primary/10 active:scale-90 transition-all"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onRemove(item.id)}
            title="Remove"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-outline hover:text-error hover:bg-error/10 active:scale-90 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ── Saved Item Card ────────────────────────────────────────────────────── */
const SavedItem = ({ item, moveToCart, removeFromSaved, compact }) => (
  <div className={`bg-surface border border-outline-variant rounded-2xl overflow-hidden flex-shrink-0 ${compact ? 'w-48 md:w-full flex md:flex-row flex-col' : 'flex'}`}>
    <div className={`bg-surface-container-low ${compact ? 'w-full h-28 md:w-16 md:h-16 flex-shrink-0' : 'w-16 h-16 flex-shrink-0'}`}>
      <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
    </div>
    <div className="p-3 flex flex-col justify-between flex-grow min-w-0">
      <p className="font-bold text-xs line-clamp-2 leading-snug">{item.name}</p>
      <div className="flex items-center justify-between gap-2 mt-2">
        <p className="text-primary font-black text-xs">{formatRwf(item.price)}</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => moveToCart(item.id)}
            className="h-7 px-2.5 rounded-lg bg-primary/10 text-primary text-[10px] font-black hover:bg-primary/20 transition-all active:scale-95 whitespace-nowrap"
          >
            Add to Cart
          </button>
          <button
            onClick={() => removeFromSaved(item.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-error/10 transition-all active:scale-90"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ── Delivery fee summary row (shared by mobile + desktop) ─────────────── */
const DeliveryFeeSummary = ({ totalPrice, isFreeDelivery, deliveryResult, defaultAddr, t }) => {
  const feeLabel = () => {
    if (isFreeDelivery) return { text: '🎉 Free!', cls: 'text-success font-black' };
    if (!deliveryResult.fee && deliveryResult.fee !== 0) {
      // Can't estimate — no address or branch
      return { text: defaultAddr ? 'Select a branch' : 'Set delivery address', cls: 'text-outline italic' };
    }
    return {
      text: `${formatRwf(deliveryResult.fee)}${deliveryResult.distance ? ` · ${deliveryResult.distance} km` : ''}`,
      cls: 'text-on-surface font-black',
    };
  };
  const { text, cls } = feeLabel();

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-2xl px-3 py-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-outline">Items total</p>
          <p className="text-xl font-black text-primary">{formatRwf(totalPrice)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-outline">Delivery fee</p>
          <p className={`text-sm ${cls}`}>{text}</p>
        </div>
      </div>
      {deliveryResult.isEstimate && !isFreeDelivery && (
        <p className="text-[9px] text-outline font-medium">
          Estimated from <span className="font-black">{defaultAddr.sector}, {defaultAddr.district}</span>. Final fee confirmed at checkout.
        </p>
      )}
    </div>
  );
};

/* ── Desktop Order Summary Sidebar ─────────────────────────────────────── */
const OrderSummary = ({
  totalPrice, isBelowMinimum, isFreeDelivery,
  remainingMinimum, remainingFreeDelivery,
  deliveryResult, defaultAddr,
  isCheckoutBlocked, t,
}) => (
  /* Outer wrapper: sticky column that fills from top-24 to the bottom of the viewport */
  <div className="sticky top-24 flex flex-col bg-surface border border-outline-variant rounded-3xl overflow-hidden"
    style={{ maxHeight: 'calc(100vh - 7rem)' }}>

    {/* Scrollable content */}
    <div className="flex-grow overflow-y-auto p-6 space-y-5 custom-scrollbar">
      <h2 className="text-xl font-bold">{t('summary')}</h2>

      {/* Dual threshold bar */}
      <OrderThresholdBar
        totalPrice={totalPrice}
        isBelowMinimum={isBelowMinimum}
        isFreeDelivery={isFreeDelivery}
        remainingMinimum={remainingMinimum}
        remainingFreeDelivery={remainingFreeDelivery}
      />

      {/* Price breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-outline font-medium">
          <span>{t('subtotal')}</span>
          <span>{formatRwf(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-sm font-medium">
          <span className="text-outline">{t('delivery_fee')}</span>
          <span className={isFreeDelivery ? 'text-success font-black' : 'text-on-surface font-black'}>
            {isFreeDelivery
              ? '🎉 Free!'
              : deliveryResult.fee != null
                ? `${formatRwf(deliveryResult.fee)}${deliveryResult.distance ? ` · ${deliveryResult.distance} km` : ''}`
                : <span className="text-outline italic text-xs">{defaultAddr ? 'Select branch' : 'Add address'}</span>
            }
          </span>
        </div>
        {deliveryResult.isEstimate && !isFreeDelivery && (
          <p className="text-[9px] text-outline font-medium leading-snug">
            Estimated from <span className="font-black">{defaultAddr?.sector}, {defaultAddr?.district}</span>. Confirmed at checkout.
          </p>
        )}
        <div className="h-px bg-outline-variant" />
        <div className="flex justify-between text-xl font-black">
          <span>{t('total')}</span>
          <span className="text-primary">
            {formatRwf(totalPrice + (isFreeDelivery || deliveryResult.fee == null ? 0 : deliveryResult.fee))}
          </span>
        </div>
        {!isFreeDelivery && deliveryResult.fee > 0 && (
          <p className="text-[9px] text-outline font-medium">{formatRwf(totalPrice)} + {formatRwf(deliveryResult.fee)} delivery</p>
        )}
      </div>
    </div>

    {/* Pinned CTA — always visible at the bottom of the sidebar */}
    <div className="shrink-0 px-6 py-4 border-t border-outline-variant bg-surface">
      <Link to="/checkout" className={`block w-full ${isCheckoutBlocked ? 'pointer-events-none' : ''}`}>
        <Button
          className={`w-full py-4 h-auto text-center text-base font-black rounded-2xl ${isCheckoutBlocked ? 'opacity-50 grayscale' : ''}`}
          disabled={isCheckoutBlocked}
        >
          {t('proceed_to_checkout')}
        </Button>
      </Link>
      <p className="text-[10px] text-center text-outline uppercase tracking-widest font-bold mt-3">
        {t('secure_checkout_badge')}
      </p>
    </div>
  </div>
);

export default Cart;
