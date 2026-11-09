/**
 * Display helper for Service.price from the API (decimal string like "80.00").
 * Never assume a `$` prefix is already present on the API value.
 */
export function formatServicePrice(price: string | number): string {
  const amount =
    typeof price === 'number' ? price : Number.parseFloat(String(price));

  if (!Number.isFinite(amount)) {
    return String(price);
  }

  return `$${amount.toFixed(2)}`;
}

/** Parse API or legacy UI price strings into a number for totals. */
export function parseServicePrice(price: string | number): number {
  if (typeof price === 'number') {
    return Number.isFinite(price) ? price : 0;
  }

  const amount = Number.parseFloat(String(price).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(amount) ? amount : 0;
}
