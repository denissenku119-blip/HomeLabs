export const cn = (...classes: (string | false | null | undefined | 0)[]) =>
  classes.filter(Boolean).join(' ');

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  if (amount === 0 || isNaN(amount)) return '—';
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] ?? '$';
  return `${symbol}${amount.toLocaleString('en-US')}`;
};

export const formatNumber = (value: number, unit: string = ''): string => {
  if (value === 0 || isNaN(value)) return '—';
  return `${value.toLocaleString('en-US')}${unit}`;
};
