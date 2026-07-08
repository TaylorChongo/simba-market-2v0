/**
 * Delivery fee calculator
 *
 * Estimates the delivery fee based on the straight-line distance between the
 * customer's sector and the selected fulfillment branch.
 *
 * Fee tiers (approximation — real routing may differ):
 *   0 –  2 km  →   700 RWF
 *   2 –  5 km  → 1,000 RWF
 *   5 –  8 km  → 1,500 RWF
 *   8 – 12 km  → 2,000 RWF
 *  12 – 15 km  → 2,500 RWF
 *  15 km+      → 3,000 RWF
 *
 * FREE when order total >= FREE_DELIVERY_THRESHOLD (60,000 RWF).
 */

import { calculateDistance } from './utils';

// ---------------------------------------------------------------------------
// Branch coordinates (matches BranchContext BRANCHES array exactly)
// ---------------------------------------------------------------------------
export const BRANCH_COORDS = {
  'Simba Supermarket UTC':           { lat: -1.9495461, lng: 30.0599714 },
  'Simba Supermarket Kigali Heights':{ lat: -1.9523434, lng: 30.0937551 },
  'Simba Supermarket Kimironko':     { lat: -1.9497712, lng: 30.1262879 },
  'Simba Supermarket Gishushu':      { lat: -1.9530302, lng: 30.1014069 },
  'Simba Supermarket Kicukiro':      { lat: -1.9818128, lng: 30.1044453 },
  'Simba Supermarket Rebero':        { lat: -1.9900556, lng: 30.0616547 },
  'Simba Kisimenti':                 { lat: -1.9596980, lng: 30.1069614 },
  'Simba Gikondo Branch':            { lat: -1.9797293, lng: 30.0772419 },
  'Simba Nyamirambo':                { lat: -1.9638560, lng: 30.0599307 },
};

// ---------------------------------------------------------------------------
// Sector → approximate centre coordinates
// Covers all Kigali sectors + frequently-reachable surrounding areas.
// For sectors not listed, we fall back to the district centroid.
// ---------------------------------------------------------------------------
const SECTOR_COORDS = {
  // ── Gasabo ────────────────────────────────────────────────────────────────
  Bumbogo:    { lat: -1.8900, lng: 30.1100 },
  Gatsata:    { lat: -1.9310, lng: 30.0680 },
  Gikomero:   { lat: -1.8720, lng: 30.1450 },
  Gisozi:     { lat: -1.9210, lng: 30.0900 },
  Jabana:     { lat: -1.8870, lng: 30.1700 },
  Jali:       { lat: -1.8760, lng: 30.1300 },
  Kacyiru:    { lat: -1.9430, lng: 30.0940 },
  Kimihurura: { lat: -1.9510, lng: 30.0970 },
  Kimironko:  { lat: -1.9470, lng: 30.1230 },
  Kinyinya:   { lat: -1.9150, lng: 30.1280 },
  Ndera:      { lat: -1.8990, lng: 30.1960 },
  Nduba:      { lat: -1.8700, lng: 30.0700 },
  Remera:     { lat: -1.9560, lng: 30.1130 },
  Rusororo:   { lat: -1.8530, lng: 30.1650 },
  Rutunga:    { lat: -1.8640, lng: 30.0980 },

  // ── Kicukiro ──────────────────────────────────────────────────────────────
  Gahanga:    { lat: -2.0180, lng: 30.0820 },
  Gatenga:    { lat: -1.9900, lng: 30.0960 },
  Gikondo:    { lat: -1.9790, lng: 30.0780 },
  Kagarama:   { lat: -1.9840, lng: 30.1150 },
  Kanombe:    { lat: -1.9710, lng: 30.1390 },
  Kicukiro:   { lat: -1.9820, lng: 30.1040 },
  Kigarama:   { lat: -1.9950, lng: 30.1230 },
  Masaka:     { lat: -2.0100, lng: 30.0700 },
  Niboye:     { lat: -1.9950, lng: 30.0900 },
  Nyarugunga: { lat: -1.9660, lng: 30.1310 },

  // ── Nyarugenge ────────────────────────────────────────────────────────────
  Gitega:       { lat: -1.9560, lng: 30.0620 },
  Kanyinya:     { lat: -1.9720, lng: 30.0490 },
  Kigali:       { lat: -1.9441, lng: 30.0619 },
  Kimisagara:   { lat: -1.9690, lng: 30.0550 },
  Mageregere:   { lat: -2.0030, lng: 30.0370 },
  Muhima:       { lat: -1.9530, lng: 30.0590 },
  Nyakabanda:   { lat: -1.9600, lng: 30.0510 },
  Nyamirambo:   { lat: -1.9640, lng: 30.0590 },
  Nyarugenge:   { lat: -1.9500, lng: 30.0570 },
  Rwezamenyo:   { lat: -1.9630, lng: 30.0650 },

  // ── Nearby districts (common delivery destinations) ───────────────────────
  // Rwamagana
  Musha:        { lat: -1.9490, lng: 30.2380 },
  Muyumbu:      { lat: -1.9190, lng: 30.2070 },
  // Bugesera
  Nyamata:      { lat: -2.1430, lng: 30.1360 },
  Rilima:       { lat: -2.0930, lng: 30.1620 },
  // Rulindo
  Burega:       { lat: -1.8090, lng: 29.9830 },
  // Muhanga
  Shyogwe:      { lat: -2.0990, lng: 29.9060 },
};

// District fallback centroids (if sector not found)
const DISTRICT_COORDS = {
  Gasabo:     { lat: -1.9100, lng: 30.1000 },
  Kicukiro:   { lat: -1.9900, lng: 30.0900 },
  Nyarugenge: { lat: -1.9600, lng: 30.0600 },
  Rwamagana:  { lat: -1.9500, lng: 30.2200 },
  Bugesera:   { lat: -2.1000, lng: 30.1600 },
  Muhanga:    { lat: -2.0800, lng: 29.9000 },
  Huye:       { lat: -2.5960, lng: 29.7390 },
  Musanze:    { lat: -1.4990, lng: 29.6340 },
  Rubavu:     { lat: -1.6780, lng: 29.2590 },
  Rusizi:     { lat: -2.4790, lng: 28.9060 },
};

/**
 * Resolve a sector/district name to {lat, lng}, or null if unknown.
 */
export function resolveSectorCoords(sector, district) {
  if (sector && SECTOR_COORDS[sector]) return SECTOR_COORDS[sector];
  if (district && DISTRICT_COORDS[district]) return DISTRICT_COORDS[district];
  return null;
}

/**
 * Calculate delivery fee in RWF.
 *
 * @param {string} branchName   - Full branch name (must match BRANCH_COORDS key)
 * @param {string} sector       - Delivery sector name
 * @param {string} district     - Delivery district name (fallback)
 * @param {number} orderTotal   - Cart total in RWF
 * @param {number} freeThreshold - Free delivery threshold in RWF
 * @returns {{ fee: number, distance: number|null, isFree: boolean, isEstimate: boolean }}
 */
export function calcDeliveryFee(branchName, sector, district, orderTotal, freeThreshold) {
  // Free delivery for large orders
  if (orderTotal >= freeThreshold) {
    return { fee: 0, distance: null, isFree: true, isEstimate: false };
  }

  const branch = BRANCH_COORDS[branchName];
  const dest   = resolveSectorCoords(sector, district);

  // If we can't resolve either endpoint, return null (unknown)
  if (!branch || !dest) {
    return { fee: null, distance: null, isFree: false, isEstimate: false };
  }

  const distance = calculateDistance(branch.lat, branch.lng, dest.lat, dest.lng);

  let fee;
  if (distance <= 2)       fee = 700;
  else if (distance <= 5)  fee = 1000;
  else if (distance <= 8)  fee = 1500;
  else if (distance <= 12) fee = 2000;
  else if (distance <= 15) fee = 2500;
  else                     fee = 3000;

  return { fee, distance: Math.round(distance * 10) / 10, isFree: false, isEstimate: true };
}
