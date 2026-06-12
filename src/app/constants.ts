/** ISO 3166-1 alpha-2 → display name */
export const COUNTRY_NAMES: Record<string, string> = {
  ES: 'Spain',          DE: 'Germany',        PT: 'Portugal',
  PL: 'Poland',         GR: 'Greece',         BG: 'Bulgaria',
  LT: 'Lithuania',      SI: 'Slovenia',       GB: 'United Kingdom',
  RO: 'Romania',        SK: 'Slovakia',       CY: 'Cyprus',
  IT: 'Italy',          HU: 'Hungary',        CZ: 'Czech Republic',
  FR: 'France',         NL: 'Netherlands',    BE: 'Belgium',
  AT: 'Austria',        HR: 'Croatia',        RS: 'Serbia',
};

export function countryLabel(code: string): string {
  return COUNTRY_NAMES[code] ? `${COUNTRY_NAMES[code]} (${code})` : code;
}

export function routeLabel(originCode: string, destCode: string): string {
  return `${COUNTRY_NAMES[originCode] ?? originCode} → ${COUNTRY_NAMES[destCode] ?? destCode}`;
}

/** Shipment status slug → display label + chart colour */
export const STATUS_META: Record<string, { label: string; color: string }> = {
  info_received:        { label: 'Info Received',        color: '#8b5cf6' },
  in_transit:           { label: 'In Transit',           color: '#3b82f6' },
  available_for_pickup: { label: 'Available for Pickup', color: '#f97316' },
  out_for_delivery:     { label: 'Out for Delivery',     color: '#14b8a6' },
  failed_attempt:       { label: 'Failed Attempt',       color: '#ef4444' },
  exception:            { label: 'Exception',            color: '#ef4444' },
  delivered:            { label: 'Delivered',            color: '#22c55e' },
  pending:              { label: 'Pending',              color: '#94a3b8' },
};

/** Delivery-speed category key → display label + chart colour */
export const SPEED_CAT_META: Record<string, { label: string; color: string }> = {
  lt2d:  { label: '< 2 days',  color: '#22c55e' },
  d2_5:  { label: '2–5 days',  color: '#3b82f6' },
  d5_10: { label: '5–10 days', color: '#f97316' },
  gt10d: { label: '> 10 days', color: '#ef4444' },
};

/** Histogram bucket_key → display label */
export const BUCKET_LABELS: Record<string, string> = {
  '0-1':  '0–1d',  '1-2':  '1–2d',  '2-3':  '2–3d',
  '3-4':  '3–4d',  '4-5':  '4–5d',  '5-6':  '5–6d',
  '6-7':  '6–7d',  '7-8':  '7–8d',  '8-9':  '8–9d',
  '9-10': '9–10d', '10-12':'10–12d','12-15':'12–15d',
  'gt15': '> 15d',
};
