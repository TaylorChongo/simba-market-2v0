/**
 * AddrForm — reusable address form fields.
 *
 * Used in:
 *  - ClientDashboard (profile → delivery addresses)
 *  - Checkout (custom delivery address)
 *
 * Props:
 *  addrProvinces  (string[])  — all available provinces
 *  addrLabel, setAddrLabel
 *  addrStreet, setAddrStreet
 *  addrLandmark, setAddrLandmark
 *  addrProvince, setAddrProvince   ← caller must also reset district/sector on change
 *  addrDistrict, setAddrDistrict  ← caller must also reset sector on change
 *  addrSector, setAddrSector
 *  addrDistricts  (string[])
 *  addrSectors    (string[])
 *  error          (string)
 */
import { ChevronDown } from 'lucide-react';
import Input from './Input';

export const LABEL_PRESETS = ['Home', 'Office', 'Other'];

const AddrForm = ({
  addrProvinces,
  addrLabel, setAddrLabel,
  addrStreet, setAddrStreet,
  addrLandmark, setAddrLandmark,
  addrProvince, setAddrProvince,
  addrDistrict, setAddrDistrict,
  addrSector, setAddrSector,
  addrDistricts, addrSectors,
  error,
}) => (
  <div className="space-y-2">
    {/* Province */}
    <div className="relative">
      <select
        value={addrProvince}
        onChange={(e) => setAddrProvince(e.target.value)}
        className="w-full h-9 rounded-lg px-3 pr-8 text-xs border bg-surface border-outline-variant text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      >
        <option value="">Select Province</option>
        {addrProvinces.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-outline" />
    </div>

    {/* District */}
    <div className="relative">
      <select
        value={addrDistrict}
        onChange={(e) => setAddrDistrict(e.target.value)}
        disabled={!addrProvince}
        className="w-full h-9 rounded-lg px-3 pr-8 text-xs border bg-surface border-outline-variant text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-40"
      >
        <option value="">{addrProvince ? 'Select District' : 'Select a Province first'}</option>
        {addrDistricts.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-outline" />
    </div>

    {/* Sector */}
    <div className="relative">
      <select
        value={addrSector}
        onChange={(e) => setAddrSector(e.target.value)}
        disabled={!addrDistrict}
        className="w-full h-9 rounded-lg px-3 pr-8 text-xs border bg-surface border-outline-variant text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-40"
      >
        <option value="">{addrDistrict ? 'Select Sector' : 'Select a District first'}</option>
        {addrSectors.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-outline" />
    </div>

    {/* Label */}
    <div className="relative">
      <select
        value={addrLabel}
        onChange={(e) => setAddrLabel(e.target.value)}
        className="w-full h-9 rounded-lg px-3 pr-8 text-xs border bg-surface border-outline-variant text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      >
        <option value="">Select a label</option>
        {LABEL_PRESETS.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-outline" />
    </div>

    {/* Street */}
    <Input
      value={addrStreet}
      onChange={(e) => setAddrStreet(e.target.value)}
      placeholder="House / Street (optional) — e.g. KG 7 Ave, No. 12"
      className="h-9 rounded-lg text-xs"
    />

    {/* Landmark */}
    <Input
      value={addrLandmark}
      onChange={(e) => setAddrLandmark(e.target.value)}
      placeholder="Landmark (optional) — e.g. Near blue gate"
      className="h-9 rounded-lg text-xs"
    />

    {error && <p className="text-[10px] font-bold text-error">{error}</p>}
  </div>
);

export default AddrForm;
