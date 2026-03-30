/**
 * QR Data Encoders
 * Converts structured data into QR-compatible strings
 */

import type { WiFiData, VCardData, EmailData, SMSData } from './types';

/** Escape special characters for WiFi QR strings */
function escapeWiFi(s: string): string {
	return s.replace(/([\\;,:"'])/g, '\\$1');
}

export function encodeURL(url: string): string {
	// Auto-prepend https:// if no protocol
	if (url && !url.match(/^https?:\/\//i)) {
		return `https://${url}`;
	}
	return url;
}

export function encodeWiFi(data: WiFiData): string {
	const parts = [
		`WIFI:T:${data.encryption}`,
		`S:${escapeWiFi(data.ssid)}`,
		`P:${escapeWiFi(data.password)}`
	];
	if (data.hidden) parts.push('H:true');
	return parts.join(';') + ';;';
}

export function encodeVCard(data: VCardData): string {
	const lines = [
		'BEGIN:VCARD',
		'VERSION:3.0',
		`N:${data.lastName};${data.firstName};;;`,
		`FN:${data.firstName} ${data.lastName}`
	];
	if (data.phone) lines.push(`TEL;TYPE=CELL:${data.phone}`);
	if (data.email) lines.push(`EMAIL:${data.email}`);
	if (data.org) lines.push(`ORG:${data.org}`);
	if (data.title) lines.push(`TITLE:${data.title}`);
	if (data.url) lines.push(`URL:${data.url}`);
	lines.push('END:VCARD');
	return lines.join('\n');
}

export function encodeEmail(data: EmailData): string {
	const params = new URLSearchParams();
	if (data.subject) params.set('subject', data.subject);
	if (data.body) params.set('body', data.body);
	const query = params.toString();
	return `mailto:${data.to}${query ? '?' + query : ''}`;
}

export function encodeSMS(data: SMSData): string {
	return `SMSTO:${data.phone}${data.message ? ':' + data.message : ''}`;
}

export function encodePhone(phone: string): string {
	return `tel:${phone}`;
}

export function encodeText(text: string): string {
	return text;
}
