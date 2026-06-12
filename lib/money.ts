// Format number as Indonesian Rupiah: "IDR 1.500.000"
export function formatIDR(amount: number): string {
  // Handle price-on-request
  if (amount === 0 || amount === null) {
    return 'Concierge to confirm';
  }

  // Indonesian number formatting: period as thousand separator
  const formatted = amount
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `IDR ${formatted}`;
}

// Parse a string number back to number (for form inputs)
export function parseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  const parsed = parseInt(value.replace(/\D/g, ''), 10);
  return isNaN(parsed) ? 0 : parsed;
}
