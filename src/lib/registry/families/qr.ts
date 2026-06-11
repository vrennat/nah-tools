import type { ToolEntry } from '../types';

// The QR hub (/qr) is a single full-featured tool page, not a link grid.
// The SEO landing pages are separate routes that link into the main /qr tool.
// /qr itself is included as a registry entry so it appears in search and popular chips.
export const qrTools: ToolEntry[] = [
	{
		path: '/qr',
		family: 'qr',
		name: 'QR Code Generator',
		description: 'URL, WiFi, vCard, batch export, dynamic codes. No expiration. No paywall.',
		icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5V16m-3.5 4H20v-3.5M4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4z',
		keywords: ['qr code', 'qr', 'generator', 'barcode', 'scan', 'dynamic qr'],
		popular: true,
		sitemap: { changefreq: 'weekly', priority: 1.0 }
	},
	{
		path: '/qr/wifi',
		family: 'qr',
		name: 'WiFi QR Code',
		description: 'Share WiFi credentials with a scannable QR code',
		keywords: ['wifi', 'qr', 'network', 'password', 'wireless', 'wi-fi'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/qr/vcard',
		family: 'qr',
		name: 'vCard QR Code',
		description: 'Share contact details as a scannable QR code',
		keywords: ['vcard', 'contact', 'qr', 'business card', 'address book'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/qr/email',
		family: 'qr',
		name: 'Email QR Code',
		description: 'Open an email compose window from a QR scan',
		keywords: ['email', 'mailto', 'qr'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/qr/phone',
		family: 'qr',
		name: 'Phone QR Code',
		description: 'Dial a phone number from a QR scan',
		keywords: ['phone', 'call', 'tel', 'qr'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/qr/sms',
		family: 'qr',
		name: 'SMS QR Code',
		description: 'Send a pre-filled text message from a QR scan',
		keywords: ['sms', 'text message', 'message', 'qr', 'texting'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	}
];
