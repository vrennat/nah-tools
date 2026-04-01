/**
 * MCP Tools — QR Code Encoding
 *
 * Encodes structured data into QR-compatible strings for all 7 content types.
 * Pure string manipulation — no DOM or canvas required.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { normalizeUrl } from '$utils/url';

// ── Encoder functions (inlined to avoid importing client-side module) ──

function escapeWiFi(s: string): string {
	return s.replace(/([\\;,:"'])/g, '\\$1');
}

function encodeURL(url: string): string {
	return url ? normalizeUrl(url) : url;
}

function encodeWiFi(ssid: string, password: string, encryption: string, hidden: boolean): string {
	const parts = [
		`WIFI:T:${encryption}`,
		`S:${escapeWiFi(ssid)}`,
		`P:${escapeWiFi(password)}`
	];
	if (hidden) parts.push('H:true');
	return parts.join(';') + ';;';
}

function encodeVCard(data: {
	firstName: string;
	lastName: string;
	phone?: string;
	email?: string;
	org?: string;
	title?: string;
	url?: string;
}): string {
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

function encodeEmail(to: string, subject?: string, body?: string): string {
	const params = new URLSearchParams();
	if (subject) params.set('subject', subject);
	if (body) params.set('body', body);
	const query = params.toString();
	return `mailto:${to}${query ? '?' + query : ''}`;
}

function encodeSMS(phone: string, message?: string): string {
	return `SMSTO:${phone}${message ? ':' + message : ''}`;
}

function encodePhone(phone: string): string {
	return `tel:${phone}`;
}

// ── Tool registration ──

export function registerQRTools(server: McpServer) {
	server.registerTool('encode_qr', {
		title: 'Encode QR Code Data',
		description:
			'Encode data into a QR-compatible string for any content type: URL, text, WiFi, vCard (contact card), email, phone, or SMS. Returns the raw encoded string that any QR generator can use.',
		inputSchema: {
			type: z
				.enum(['url', 'text', 'wifi', 'vcard', 'email', 'phone', 'sms'])
				.describe('The type of QR code content to encode'),
			// URL
			url: z.string().optional().describe('URL to encode (for type "url")'),
			// Text
			text: z.string().optional().describe('Plain text to encode (for type "text")'),
			// WiFi
			ssid: z.string().optional().describe('WiFi network name (for type "wifi")'),
			password: z.string().optional().describe('WiFi password (for type "wifi")'),
			encryption: z
				.enum(['WPA', 'WEP', 'nopass'])
				.optional()
				.describe('WiFi encryption type (for type "wifi", default: WPA)'),
			hidden: z.boolean().optional().describe('Whether WiFi is hidden (for type "wifi")'),
			// vCard
			first_name: z.string().optional().describe('First name (for type "vcard")'),
			last_name: z.string().optional().describe('Last name (for type "vcard")'),
			phone: z.string().optional().describe('Phone number (for types "vcard", "phone", "sms")'),
			email: z.string().optional().describe('Email address (for types "vcard", "email")'),
			org: z.string().optional().describe('Organization (for type "vcard")'),
			title: z.string().optional().describe('Job title (for type "vcard")'),
			contact_url: z.string().optional().describe('Website URL (for type "vcard")'),
			// Email
			email_subject: z.string().optional().describe('Email subject (for type "email")'),
			email_body: z.string().optional().describe('Email body (for type "email")'),
			// SMS
			sms_message: z.string().optional().describe('SMS message body (for type "sms")')
		},
		annotations: {
			readOnlyHint: true
		}
	}, async (params) => {
		try {
			let encoded: string;

			switch (params.type) {
				case 'url':
					if (!params.url) return error('Missing required field: url');
					encoded = encodeURL(params.url);
					break;
				case 'text':
					if (!params.text) return error('Missing required field: text');
					encoded = params.text;
					break;
				case 'wifi':
					if (!params.ssid) return error('Missing required field: ssid');
					encoded = encodeWiFi(
						params.ssid,
						params.password ?? '',
						params.encryption ?? 'WPA',
						params.hidden ?? false
					);
					break;
				case 'vcard':
					if (!params.first_name || !params.last_name)
						return error('Missing required fields: first_name and last_name');
					encoded = encodeVCard({
						firstName: params.first_name,
						lastName: params.last_name,
						phone: params.phone,
						email: params.email,
						org: params.org,
						title: params.title,
						url: params.contact_url
					});
					break;
				case 'email':
					if (!params.email) return error('Missing required field: email');
					encoded = encodeEmail(params.email, params.email_subject, params.email_body);
					break;
				case 'phone':
					if (!params.phone) return error('Missing required field: phone');
					encoded = encodePhone(params.phone);
					break;
				case 'sms':
					if (!params.phone) return error('Missing required field: phone');
					encoded = encodeSMS(params.phone, params.sms_message);
					break;
				default:
					return error(`Unknown QR type: ${params.type}`);
			}

			return {
				content: [{
					type: 'text' as const,
					text: JSON.stringify({
						type: params.type,
						encoded_data: encoded,
						note: 'This is the raw string to embed in a QR code. Use any QR code generator to create the image.'
					}, null, 2)
				}]
			};
		} catch (e) {
			return error(e instanceof Error ? e.message : String(e));
		}
	});
}

function error(message: string) {
	return { content: [{ type: 'text' as const, text: message }], isError: true };
}
