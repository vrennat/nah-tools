/**
 * QR Data Encoders
 * Converts structured data into QR-compatible strings
 */

import type { WiFiData, VCardData, EmailData, SMSData } from './types';
import { normalizeUrl } from '$utils/url';

/** Escape special characters for WiFi QR strings */
function escapeWiFi(s: string): string {
	return s.replace(/([\\;,:"'])/g, '\\$1');
}

export function encodeURL(url: string): string {
	return url ? normalizeUrl(url) : url;
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

/** Escape special characters per RFC 6350 section 3.4 (backslash, semicolon, comma, newline). */
function escapeVCard(s: string): string {
	return s
		.replace(/\\/g, '\\\\')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,')
		.replace(/\n/g, '\\n');
}

export function encodeVCard(data: VCardData): string {
	const lines = [
		'BEGIN:VCARD',
		'VERSION:3.0',
		// N field uses semicolons as component separators — escape values, not separators.
		`N:${escapeVCard(data.lastName)};${escapeVCard(data.firstName)};;;`,
		`FN:${escapeVCard(data.firstName)} ${escapeVCard(data.lastName)}`
	];
	if (data.phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(data.phone)}`);
	if (data.email) lines.push(`EMAIL:${escapeVCard(data.email)}`);
	if (data.org) lines.push(`ORG:${escapeVCard(data.org)}`);
	if (data.title) lines.push(`TITLE:${escapeVCard(data.title)}`);
	if (data.url) lines.push(`URL:${data.url}`);
	lines.push('END:VCARD');
	// RFC 6350 requires CRLF line endings.
	return lines.join('\r\n');
}

export function encodeEmail(data: EmailData): string {
	const params = new URLSearchParams();
	if (data.subject) params.set('subject', data.subject);
	if (data.body) params.set('body', data.body);
	const query = params.toString();
	return `mailto:${data.to}${query ? '?' + query : ''}`;
}

export function encodeSMS(data: SMSData): string {
	// SMSTO format: SMSTO:<phone>:<message>
	// The SMSTO spec has no escape mechanism for colons. When the message
	// contains a colon, some parsers truncate at the first colon in the body.
	// Most modern readers (iOS, Android) parse the remainder correctly because
	// they split on only the second colon. We emit the raw value since
	// replacing or stripping colons would silently corrupt user data.
	return `SMSTO:${data.phone}${data.message ? ':' + data.message : ''}`;
}

export function encodePhone(phone: string): string {
	return `tel:${phone}`;
}

export function encodeText(text: string): string {
	return text;
}
