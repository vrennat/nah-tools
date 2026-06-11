import type { ToolEntry } from '../types';

// The QR hub (/qr) is a single full-featured tool page, not a link grid.
// The SEO landing pages are separate routes that link into the main /qr tool.
export const qrTools: ToolEntry[] = [
	{
		path: '/qr/wifi',
		family: 'qr',
		name: 'WiFi QR Code',
		description: 'Share WiFi credentials with a scannable QR code',
		keywords: ['wifi', 'qr', 'network', 'password'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/qr/vcard',
		family: 'qr',
		name: 'vCard QR Code',
		description: 'Share contact details as a scannable QR code',
		keywords: ['vcard', 'contact', 'qr', 'business card'],
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
		keywords: ['sms', 'text', 'message', 'qr'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	}
];
