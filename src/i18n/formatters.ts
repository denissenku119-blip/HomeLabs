import { formatCurrency, getCurrencySymbol as getCurrencySymbolFromRegistry } from '@/data/currencies';

export function formatCostLocale(
  amount: number,
  currency: string,
  locale: string = 'en-US'
): string {
  return formatCurrency(amount, currency, locale);
}

export function formatNumberLocale(
  value: number,
  locale: string = 'en-US',
  decimals: number = 0
): string {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return value.toString();
  }
}

export function formatDateLocale(date: Date, locale: string = 'en-US'): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

export function getCurrencySymbol(currency: string): string {
  return getCurrencySymbolFromRegistry(currency);
}
