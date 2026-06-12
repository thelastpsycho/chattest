import { ServiceCatalog } from './types';

// Service catalog from §4
export const SERVICE_CATALOG: ServiceCatalog[] = [
  {
    id: 1,
    name: 'Airport Transfer',
    price: 300000,
    captureFields: [
      { type: 'quantity', label: 'Number of cars', key: 'cars', min: 1, max: 10, default: 1 },
      { type: 'select', label: 'Direction', key: 'direction', options: ['Arrival', 'Departure', 'Both'] },
      { type: 'date', label: 'Date', key: 'date' },
      { type: 'text', label: 'Flight number (optional)', key: 'flightNo', optional: true },
    ],
  },
  {
    id: 2,
    name: 'Daily Half Board',
    price: 400000,
    captureFields: [
      { type: 'quantity', label: 'Number of guests', key: 'pax', min: 1, max: 20, default: 2 },
      { type: 'quantity', label: 'Number of days', key: 'days', min: 1, max: 14, default: 1 },
    ],
  },
  {
    id: 3,
    name: 'Spa Experience (60 min)',
    price: 400000,
    captureFields: [
      { type: 'quantity', label: 'Number of guests', key: 'pax', min: 1, max: 10, default: 1 },
      { type: 'date', label: 'Preferred date', key: 'date' },
      { type: 'time', label: 'Preferred time', key: 'time' },
    ],
  },
  {
    id: 4,
    name: 'Romantic Dinner',
    price: 1500000,
    captureFields: [
      { type: 'quantity', label: 'Number of couples', key: 'couples', min: 1, max: 5, default: 1 },
      { type: 'date', label: 'Date', key: 'date' },
    ],
  },
  {
    id: 5,
    name: 'Sunset Cocktails (5-7 PM)',
    price: 200000,
    captureFields: [
      { type: 'quantity', label: 'Number of guests', key: 'pax', min: 1, max: 20, default: 2 },
      { type: 'date', label: 'Date', key: 'date' },
    ],
  },
  {
    id: 6,
    name: 'Tours & Experiences',
    price: null, // Concierge to confirm
    captureFields: [
      { type: 'text', label: 'Tell us what you\'d like to experience', key: 'notes' },
    ],
  },
  {
    id: 7,
    name: 'Gourmet Savings Deal',
    price: null, // Price depends on voucher option
    captureFields: [
      {
        type: 'select',
        label: 'Voucher option',
        key: 'option',
        options: [
          'GSD #1 — Value IDR 2,000,000 (pay IDR 1,700,000)',
          'GSD #2 — Value IDR 5,000,000 (pay IDR 4,000,000)',
        ]
      },
      { type: 'quantity', label: 'Number of vouchers', key: 'qty', min: 1, max: 10, default: 1 },
    ],
  },
  {
    id: 8,
    name: 'Cooking Class',
    price: 400000,
    captureFields: [
      { type: 'pax', label: 'Number of guests', key: 'pax', min: 4, note: 'Minimum 4 guests required' },
      { type: 'date', label: 'Date', key: 'date' },
    ],
  },
];

// Room upgrade options (§6 - placeholders until confirmed)
export const ROOM_UPGRADE_CATEGORIES = [
  'Deluxe Room',
  'Premier Room',
  'Anvaya Suite',
  'One-Bedroom Pool Villa',
  'Two-Bedroom Pool Villa',
];

// Calculate line total for a service selection
export function calculateLineTotal(serviceId: number, values: Record<string, string | number>): number {
  const service = SERVICE_CATALOG.find(s => s.id === serviceId);
  if (!service) return 0;

  if (serviceId === 7) {
    // Gourmet Savings: special handling
    const option = values.option as string;
    const unitPrice = option?.includes('GSD #1') ? 1700000 : 4000000;
    return unitPrice * ((values.qty as number) || 1);
  }

  if (service.price === null) return 0;

  const price = service.price;

  switch (serviceId) {
    case 1: // Airport Transfer: 300k × cars × (1 or 2 ways)
      const cars = (values.cars as number) || 1;
      const direction = values.direction as string;
      const ways = direction === 'Both' ? 2 : 1;
      return price * cars * ways;

    case 2: // Half Board: 400k × pax × days
      const pax = (values.pax as number) || 1;
      const days = (values.days as number) || 1;
      return price * pax * days;

    case 3: // Spa: 400k × pax
      return price * ((values.pax as number) || 1);

    case 4: // Romantic Dinner: 1.5M × couples
      return price * ((values.couples as number) || 1);

    case 5: // Sunset Cocktails: 200k × pax (fixed 1 hour)
      return price * ((values.pax as number) || 1);

    case 7: // Gourmet Savings: depends on option
      const option = values.option as string;
      const unitPrice = option?.includes('GSD #1') ? 1700000 : 4000000;
      return unitPrice * ((values.qty as number) || 1);

    case 8: // Cooking Class: 400k × pax
      return price * ((values.pax as number) || 1);

    default:
      return 0;
  }
}

// Validate service selection
export function validateServiceSelection(serviceId: number, values: Record<string, string | number>): { valid: boolean; error?: string } {
  const service = SERVICE_CATALOG.find(s => s.id === serviceId);
  if (!service) return { valid: false, error: 'Service not found' };

  // Cooking Class: minimum 4 pax
  if (serviceId === 8) {
    const pax = values.pax as number;
    if (pax < 4) {
      return { valid: false, error: 'Cooking Class requires at least 4 guests' };
    }
  }

  return { valid: true };
}
