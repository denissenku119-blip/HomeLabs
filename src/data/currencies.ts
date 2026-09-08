export interface CurrencyDefinition {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  enabled: boolean;
}

export const CURRENCIES: CurrencyDefinition[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, enabled: true },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, enabled: true },
  { code: 'GBP', name: 'Pound Sterling', symbol: '£', decimals: 2, enabled: true },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', decimals: 2, enabled: true },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'AU$', decimals: 2, enabled: true },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2, enabled: true },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, enabled: true },
  { code: 'CNY', name: 'Chinese Yuan', symbol: 'CN¥', decimals: 2, enabled: true },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2, enabled: true },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2, enabled: true },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2, enabled: true },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: 'PKRs', decimals: 2, enabled: true },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', decimals: 2, enabled: true },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', decimals: 2, enabled: true },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'NRs', decimals: 2, enabled: true },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', decimals: 2, enabled: true },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', decimals: 2, enabled: true },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', decimals: 2, enabled: true },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', decimals: 3, enabled: true },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', decimals: 3, enabled: true },
  { code: 'OMR', name: 'Omani Rial', symbol: 'OMR', decimals: 3, enabled: true },
  { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', decimals: 2, enabled: true },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2, enabled: true },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', decimals: 2, enabled: true },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', decimals: 2, enabled: true },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', decimals: 2, enabled: true },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimals: 2, enabled: true },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimals: 0, enabled: true },
  { code: 'RON', name: 'Romanian Leu', symbol: 'RON', decimals: 2, enabled: true },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'BGN', decimals: 2, enabled: true },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2, enabled: true },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2, enabled: true },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2, enabled: true },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2, enabled: true },
  { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', decimals: 0, enabled: true },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2, enabled: true },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimals: 2, enabled: true },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', decimals: 2, enabled: true },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', decimals: 2, enabled: true },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD', decimals: 2, enabled: true },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'DA', decimals: 2, enabled: true },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'DT', decimals: 3, enabled: true },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', decimals: 2, enabled: true },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', decimals: 2, enabled: true },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', decimals: 2, enabled: true },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', decimals: 0, enabled: true },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RFw', decimals: 0, enabled: true },
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', decimals: 0, enabled: true },
  { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', decimals: 0, enabled: true },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P', decimals: 2, enabled: true },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', decimals: 2, enabled: true },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', decimals: 2, enabled: true },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', decimals: 2, enabled: true },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2, enabled: true },
  { code: 'ARS', name: 'Argentine Peso', symbol: 'AR$', decimals: 2, enabled: true },
  { code: 'CLP', name: 'Chilean Peso', symbol: 'CL$', decimals: 0, enabled: true },
  { code: 'COP', name: 'Colombian Peso', symbol: 'CO$', decimals: 0, enabled: true },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', decimals: 2, enabled: true },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', decimals: 2, enabled: true },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', decimals: 2, enabled: true },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs', decimals: 2, enabled: true },
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', decimals: 2, enabled: true },
  { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', decimals: 2, enabled: true },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'GTQ', decimals: 2, enabled: true },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', decimals: 2, enabled: true },
  { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: 'TT$', decimals: 2, enabled: true },
  { code: 'BBD', name: 'Barbados Dollar', symbol: 'Bds$', decimals: 2, enabled: true },
  { code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$', decimals: 2, enabled: true },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$', decimals: 2, enabled: true },
  { code: 'FJD', name: 'Fiji Dollar', symbol: 'FJ$', decimals: 2, enabled: true },
  { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', decimals: 2, enabled: true },
  { code: 'WST', name: 'Samoan Tala', symbol: 'WS$', decimals: 2, enabled: true },
  { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$', decimals: 2, enabled: true },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', decimals: 0, enabled: true },
  { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$', decimals: 2, enabled: true },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimals: 0, enabled: true },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimals: 2, enabled: true },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimals: 2, enabled: true },
  { code: 'VND', name: 'Vietnamese Đồng', symbol: '₫', decimals: 0, enabled: true },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', decimals: 2, enabled: true },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', decimals: 2, enabled: true },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', decimals: 2, enabled: true },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭', decimals: 2, enabled: true },
  { code: 'MNT', name: 'Mongolian Tögrög', symbol: '₮', decimals: 2, enabled: true },
  { code: 'BND', name: 'Brunei Dollar', symbol: 'BN$', decimals: 2, enabled: true },
  { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu', decimals: 2, enabled: true },
  { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf', decimals: 2, enabled: true },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0, enabled: true },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', decimals: 2, enabled: true },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', decimals: 2, enabled: true },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', decimals: 2, enabled: true },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾', decimals: 2, enabled: true },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏', decimals: 2, enabled: true },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br', decimals: 2, enabled: true },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', decimals: 2, enabled: true },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин', decimals: 2, enabled: true },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', decimals: 2, enabled: true },
  { code: 'BAM', name: 'Bosnia-Herzegovina Mark', symbol: 'KM', decimals: 2, enabled: true },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', decimals: 2, enabled: true },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L', decimals: 2, enabled: true },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'LD', decimals: 3, enabled: true },
  { code: 'SYP', name: 'Syrian Pound', symbol: 'S£', decimals: 2, enabled: true },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JD', decimals: 3, enabled: true },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'L£', decimals: 2, enabled: true },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'IQD', decimals: 3, enabled: true },
  { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', decimals: 2, enabled: true },
  { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', decimals: 2, enabled: true },
  { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲', decimals: 0, enabled: true },
  { code: 'GYD', name: 'Guyanese Dollar', symbol: 'G$', decimals: 2, enabled: true },
  { code: 'SRD', name: 'Surinamese Dollar', symbol: 'Sr$', decimals: 2, enabled: true },
  { code: 'VEF', name: 'Venezuelan Bolívar', symbol: 'Bs', decimals: 2, enabled: true },
  { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', decimals: 2, enabled: true },
  { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', decimals: 2, enabled: true },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/', decimals: 2, enabled: true },
  { code: 'HTG', name: 'Haitian Gourde', symbol: 'G', decimals: 2, enabled: true },
  { code: 'CUP', name: 'Cuban Peso', symbol: '₱', decimals: 2, enabled: true },
  { code: 'AWG', name: 'Aruban Florin', symbol: 'ƒ', decimals: 2, enabled: true },
  { code: 'ANG', name: 'Netherlands Antillean Guilder', symbol: 'ƒ', decimals: 2, enabled: true },
  { code: 'KMF', name: 'Comorian Franc', symbol: 'CF', decimals: 0, enabled: true },
  { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', decimals: 0, enabled: true },
  { code: 'ERF', name: 'Eritrean Nakfa', symbol: 'ERN', decimals: 2, enabled: true },
  { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', decimals: 2, enabled: true },
  { code: 'GNF', name: 'Guinean Franc', symbol: 'FG', decimals: 0, enabled: true },
  { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', decimals: 2, enabled: true },
  { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$', decimals: 2, enabled: true },
  { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', decimals: 2, enabled: true },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', decimals: 2, enabled: true },
  { code: 'SLL', name: 'Sierra Leonean Leone', symbol: 'Le', decimals: 2, enabled: true },
  { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh', decimals: 2, enabled: true },
  { code: 'SSP', name: 'South Sudanese Pound', symbol: '£', decimals: 2, enabled: true },
  { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'L', decimals: 2, enabled: true },
  { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨', decimals: 2, enabled: true },
  { code: 'STD', name: 'São Tomé Dobra', symbol: 'Db', decimals: 2, enabled: true },
  { code: 'CDF', name: 'Congolese Franc', symbol: 'FC', decimals: 2, enabled: true },
  { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', decimals: 2, enabled: true },
  { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu', decimals: 0, enabled: true },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', decimals: 2, enabled: true },
  { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$', decimals: 2, enabled: true },
  { code: 'KPV', name: 'CFA Franc BEAC', symbol: 'FCFA', decimals: 0, enabled: true },
  { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM', decimals: 2, enabled: true },
  { code: 'SDG', name: 'Sudanese Pound', symbol: '£', decimals: 2, enabled: true },
];

const CURRENCY_MAP = new Map(CURRENCIES.map((c) => [c.code, c]));

export function getCurrency(code: string): CurrencyDefinition | undefined {
  return CURRENCY_MAP.get(code);
}

export function getCurrencySymbol(code: string): string {
  return CURRENCY_MAP.get(code)?.symbol ?? code;
}

export function getCurrencyDecimals(code: string): number {
  return CURRENCY_MAP.get(code)?.decimals ?? 2;
}

export function isValidCurrency(code: string): boolean {
  return CURRENCY_MAP.has(code);
}

export function getEnabledCurrencies(): CurrencyDefinition[] {
  return CURRENCIES.filter((c) => c.enabled);
}

export function formatCurrency(
  amount: number,
  code: string,
  locale: string = 'en-US'
): string {
  if (amount === 0) return '—';
  const def = getCurrency(code);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: def?.decimals ?? 2,
      maximumFractionDigits: def?.decimals ?? 2,
    }).format(amount);
  } catch {
    const symbol = def?.symbol ?? code;
    return `${symbol}${amount.toLocaleString(locale, {
      minimumFractionDigits: def?.decimals ?? 2,
      maximumFractionDigits: def?.decimals ?? 2,
    })}`;
  }
}
