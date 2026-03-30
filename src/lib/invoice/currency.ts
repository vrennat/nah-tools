import type { CurrencyDef } from './types';

export const CURRENCIES: CurrencyDef[] = [
	// Common currencies first
	{ code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', decimals: 2 },
	{ code: 'EUR', symbol: '\u20AC', name: 'Euro', locale: 'de-DE', decimals: 2 },
	{ code: 'GBP', symbol: '\u00A3', name: 'British Pound', locale: 'en-GB', decimals: 2 },
	{ code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA', decimals: 2 },
	{ code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', decimals: 2 },
	{ code: 'JPY', symbol: '\u00A5', name: 'Japanese Yen', locale: 'ja-JP', decimals: 0 },
	{ code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH', decimals: 2 },
	{ code: 'INR', symbol: '\u20B9', name: 'Indian Rupee', locale: 'en-IN', decimals: 2 },
	{ code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR', decimals: 2 },
	{ code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', locale: 'es-MX', decimals: 2 },
	{ code: 'CNY', symbol: '\u00A5', name: 'Chinese Yuan', locale: 'zh-CN', decimals: 2 },
	{ code: 'KRW', symbol: '\u20A9', name: 'South Korean Won', locale: 'ko-KR', decimals: 0 },
	{ code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG', decimals: 2 },
	{ code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'en-HK', decimals: 2 },
	{ code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO', decimals: 2 },
	{ code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE', decimals: 2 },
	{ code: 'DKK', symbol: 'kr', name: 'Danish Krone', locale: 'da-DK', decimals: 2 },
	{ code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ', decimals: 2 },
	{ code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA', decimals: 2 },
	{ code: 'PLN', symbol: 'z\u0142', name: 'Polish Zloty', locale: 'pl-PL', decimals: 2 },
	{ code: 'CZK', symbol: 'K\u010D', name: 'Czech Koruna', locale: 'cs-CZ', decimals: 2 },
	{ code: 'TRY', symbol: '\u20BA', name: 'Turkish Lira', locale: 'tr-TR', decimals: 2 },
	{ code: 'THB', symbol: '\u0E3F', name: 'Thai Baht', locale: 'th-TH', decimals: 2 },
	{ code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID', decimals: 0 },
	{ code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY', decimals: 2 },
	{ code: 'PHP', symbol: '\u20B1', name: 'Philippine Peso', locale: 'en-PH', decimals: 2 },
	{ code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'ar-AE', decimals: 2 },
	{ code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', locale: 'ar-SA', decimals: 2 },
	{ code: 'ILS', symbol: '\u20AA', name: 'Israeli Shekel', locale: 'he-IL', decimals: 2 },
	{ code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', locale: 'zh-TW', decimals: 0 },
	{ code: 'ARS', symbol: 'AR$', name: 'Argentine Peso', locale: 'es-AR', decimals: 2 },
	{ code: 'CLP', symbol: 'CL$', name: 'Chilean Peso', locale: 'es-CL', decimals: 0 },
	{ code: 'COP', symbol: 'CO$', name: 'Colombian Peso', locale: 'es-CO', decimals: 0 },
	{ code: 'NGN', symbol: '\u20A6', name: 'Nigerian Naira', locale: 'en-NG', decimals: 2 },
	{ code: 'EGP', symbol: 'E\u00A3', name: 'Egyptian Pound', locale: 'ar-EG', decimals: 2 },
	{ code: 'RON', symbol: 'lei', name: 'Romanian Leu', locale: 'ro-RO', decimals: 2 },
	{ code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', locale: 'hu-HU', decimals: 0 },
	{ code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', locale: 'bg-BG', decimals: 2 },
	{ code: 'VND', symbol: '\u20AB', name: 'Vietnamese Dong', locale: 'vi-VN', decimals: 0 }
];

const currencyMap = new Map(CURRENCIES.map((c) => [c.code, c]));

export function getCurrency(code: string): CurrencyDef {
	return currencyMap.get(code) ?? CURRENCIES[0];
}

const formatterCache = new Map<string, Intl.NumberFormat>();

export function formatCurrency(amount: number, currencyCode: string): string {
	let formatter = formatterCache.get(currencyCode);
	if (!formatter) {
		const def = getCurrency(currencyCode);
		formatter = new Intl.NumberFormat(def.locale, {
			style: 'currency',
			currency: def.code,
			minimumFractionDigits: def.decimals,
			maximumFractionDigits: def.decimals
		});
		formatterCache.set(currencyCode, formatter);
	}
	return formatter.format(amount);
}

const numberFormatterCache = new Map<string, Intl.NumberFormat>();

export function formatNumber(amount: number, currencyCode: string): string {
	let formatter = numberFormatterCache.get(currencyCode);
	if (!formatter) {
		const def = getCurrency(currencyCode);
		formatter = new Intl.NumberFormat(def.locale, {
			minimumFractionDigits: def.decimals,
			maximumFractionDigits: def.decimals
		});
		numberFormatterCache.set(currencyCode, formatter);
	}
	return formatter.format(amount);
}
