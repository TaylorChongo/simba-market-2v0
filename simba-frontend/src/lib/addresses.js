/**
 * Address helpers
 *
 * Addresses are stored in user.address as a JSON string containing an array:
 *
 *   [
 *     { label: "Home", street: "KG 7 Ave, No. 12", sector: "Gisozi", district: "Gasabo", province: "Kigali", isDefault: true },
 *     { label: "Office", street: "KN 5 Rd", sector: "Nyarugenge", district: "Nyarugenge", province: "Kigali", isDefault: false }
 *   ]
 *
 * Index 0 is always the default address (the one with isDefault: true).
 * Legacy plain strings are handled gracefully.
 */

/**
 * Parse the raw user.address value into an array of address objects.
 * Falls back to wrapping a legacy plain-string into a single entry.
 */
export function parseAddresses(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // legacy plain string — wrap it
  }
  // Legacy: treat the string as "Sector, District, Province" or free-form
  return [{ label: 'Home', street: '', sector: raw, district: '', province: '', isDefault: true }];
}

/**
 * Serialise an array of address objects back to a JSON string for storage.
 * Always ensures exactly one entry has isDefault: true (the first one).
 */
export function serialiseAddresses(addresses) {
  if (!addresses.length) return '';
  const normalised = addresses.map((a, i) => ({ ...a, isDefault: i === 0 }));
  return JSON.stringify(normalised);
}

/**
 * Return the default address object, or null.
 */
export function getDefaultAddress(raw) {
  const list = parseAddresses(raw);
  return list.find((a) => a.isDefault) ?? list[0] ?? null;
}

/**
 * Format an address object into a single human-readable string.
 */
export function formatAddress(addr) {
  if (!addr) return '';
  const parts = [addr.street, addr.sector, addr.district, addr.province].filter(Boolean);
  return parts.join(', ');
}

/**
 * Build a new address object (not yet in the array).
 */
export function buildAddress({ label, street, landmark, sector, district, province }) {
  return { label, street, landmark, sector, district, province, isDefault: false };
}
