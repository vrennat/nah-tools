import { describe, it, expect } from 'vitest';
import {
	encodeURL,
	encodeWiFi,
	encodeVCard,
	encodeEmail,
	encodeSMS,
	encodePhone,
	encodeText
} from '$qr/encoder';

describe('encodeURL', () => {
	it('returns a URL with https:// unchanged', () => {
		expect(encodeURL('https://example.com')).toBe('https://example.com');
	});

	it('returns a URL with http:// unchanged', () => {
		expect(encodeURL('http://example.com')).toBe('http://example.com');
	});

	it('prepends https:// to a bare domain', () => {
		expect(encodeURL('example.com')).toBe('https://example.com');
	});

	it('preserves path and query on bare domains', () => {
		expect(encodeURL('example.com/path?q=1')).toBe('https://example.com/path?q=1');
	});

	it('returns empty string unchanged', () => {
		expect(encodeURL('')).toBe('');
	});
});

describe('encodeWiFi', () => {
	it('produces correct WIFI: format for WPA', () => {
		expect(
			encodeWiFi({ ssid: 'MyNetwork', password: 'secret123', encryption: 'WPA' })
		).toBe('WIFI:T:WPA;S:MyNetwork;P:secret123;;');
	});

	it('produces correct format for WEP encryption', () => {
		expect(
			encodeWiFi({ ssid: 'Net', password: 'pass', encryption: 'WEP' })
		).toBe('WIFI:T:WEP;S:Net;P:pass;;');
	});

	it('produces correct format for nopass encryption', () => {
		expect(
			encodeWiFi({ ssid: 'Open', password: '', encryption: 'nopass' })
		).toBe('WIFI:T:nopass;S:Open;P:;;');
	});

	it('includes H:true when hidden is true', () => {
		expect(
			encodeWiFi({ ssid: 'Hidden', password: 'pw', encryption: 'WPA', hidden: true })
		).toBe('WIFI:T:WPA;S:Hidden;P:pw;H:true;;');
	});

	it('omits H:true when hidden is false', () => {
		expect(
			encodeWiFi({ ssid: 'Visible', password: 'pw', encryption: 'WPA', hidden: false })
		).toBe('WIFI:T:WPA;S:Visible;P:pw;;');
	});

	it('escapes semicolons in SSID and password', () => {
		expect(
			encodeWiFi({ ssid: 'My;Net', password: 'pa;ss', encryption: 'WPA' })
		).toBe('WIFI:T:WPA;S:My\\;Net;P:pa\\;ss;;');
	});

	it('escapes colons in SSID and password', () => {
		expect(
			encodeWiFi({ ssid: 'My:Net', password: 'pa:ss', encryption: 'WPA' })
		).toBe('WIFI:T:WPA;S:My\\:Net;P:pa\\:ss;;');
	});

	it('escapes double quotes in SSID and password', () => {
		expect(
			encodeWiFi({ ssid: 'My"Net', password: 'pa"ss', encryption: 'WPA' })
		).toBe('WIFI:T:WPA;S:My\\"Net;P:pa\\"ss;;');
	});

	it('escapes single quotes in SSID and password', () => {
		expect(
			encodeWiFi({ ssid: "My'Net", password: "pa'ss", encryption: 'WPA' })
		).toBe("WIFI:T:WPA;S:My\\'Net;P:pa\\'ss;;");
	});

	it('escapes backslashes in SSID and password', () => {
		expect(
			encodeWiFi({ ssid: 'My\\Net', password: 'pa\\ss', encryption: 'WPA' })
		).toBe('WIFI:T:WPA;S:My\\\\Net;P:pa\\\\ss;;');
	});

	it('escapes commas in SSID and password', () => {
		expect(
			encodeWiFi({ ssid: 'My,Net', password: 'pa,ss', encryption: 'WPA' })
		).toBe('WIFI:T:WPA;S:My\\,Net;P:pa\\,ss;;');
	});

	it('escapes multiple special characters together', () => {
		expect(
			encodeWiFi({ ssid: 'a;b:c', password: 'd"e,f', encryption: 'WPA' })
		).toBe('WIFI:T:WPA;S:a\\;b\\:c;P:d\\"e\\,f;;');
	});
});

describe('encodeVCard', () => {
	it('produces correct BEGIN/END envelope with required fields only', () => {
		const result = encodeVCard({ firstName: 'Jane', lastName: 'Doe' });
		const lines = result.split('\n');
		expect(lines[0]).toBe('BEGIN:VCARD');
		expect(lines[1]).toBe('VERSION:3.0');
		expect(lines[2]).toBe('N:Doe;Jane;;;');
		expect(lines[3]).toBe('FN:Jane Doe');
		expect(lines[lines.length - 1]).toBe('END:VCARD');
		expect(lines.length).toBe(5);
	});

	it('includes all optional fields when present', () => {
		const result = encodeVCard({
			firstName: 'John',
			lastName: 'Smith',
			phone: '+1234567890',
			email: 'john@example.com',
			org: 'Acme Inc',
			title: 'Engineer',
			url: 'https://example.com'
		});
		const lines = result.split('\n');
		expect(lines).toContain('TEL;TYPE=CELL:+1234567890');
		expect(lines).toContain('EMAIL:john@example.com');
		expect(lines).toContain('ORG:Acme Inc');
		expect(lines).toContain('TITLE:Engineer');
		expect(lines).toContain('URL:https://example.com');
		expect(lines[0]).toBe('BEGIN:VCARD');
		expect(lines[lines.length - 1]).toBe('END:VCARD');
		expect(lines.length).toBe(10);
	});

	it('omits phone when not provided', () => {
		const result = encodeVCard({ firstName: 'A', lastName: 'B', email: 'a@b.com' });
		expect(result).not.toContain('TEL');
	});

	it('omits email when not provided', () => {
		const result = encodeVCard({ firstName: 'A', lastName: 'B', phone: '+1' });
		expect(result).not.toContain('EMAIL');
	});

	it('omits org when not provided', () => {
		const result = encodeVCard({ firstName: 'A', lastName: 'B' });
		expect(result).not.toContain('ORG');
	});

	it('omits title when not provided', () => {
		const result = encodeVCard({ firstName: 'A', lastName: 'B' });
		expect(result).not.toContain('TITLE');
	});

	it('omits url when not provided', () => {
		const result = encodeVCard({ firstName: 'A', lastName: 'B' });
		expect(result).not.toContain('URL');
	});
});

describe('encodeEmail', () => {
	it('produces mailto: with no query when no subject or body', () => {
		expect(encodeEmail({ to: 'user@example.com' })).toBe('mailto:user@example.com');
	});

	it('appends subject only', () => {
		expect(encodeEmail({ to: 'user@example.com', subject: 'Hello' })).toBe(
			'mailto:user@example.com?subject=Hello'
		);
	});

	it('appends body only', () => {
		expect(encodeEmail({ to: 'user@example.com', body: 'Hi there' })).toBe(
			'mailto:user@example.com?body=Hi+there'
		);
	});

	it('appends both subject and body', () => {
		const result = encodeEmail({ to: 'user@example.com', subject: 'Hi', body: 'World' });
		expect(result).toBe('mailto:user@example.com?subject=Hi&body=World');
	});

	it('URL-encodes special characters in subject and body', () => {
		const result = encodeEmail({
			to: 'user@example.com',
			subject: 'Hello & Goodbye',
			body: 'Line=1'
		});
		expect(result).toContain('subject=Hello+%26+Goodbye');
		expect(result).toContain('body=Line%3D1');
	});

	it('omits subject from query when subject is empty string', () => {
		expect(encodeEmail({ to: 'user@example.com', subject: '', body: 'text' })).toBe(
			'mailto:user@example.com?body=text'
		);
	});

	it('omits body from query when body is empty string', () => {
		expect(encodeEmail({ to: 'user@example.com', subject: 'Hi', body: '' })).toBe(
			'mailto:user@example.com?subject=Hi'
		);
	});
});

describe('encodeSMS', () => {
	it('produces SMSTO format with message', () => {
		expect(encodeSMS({ phone: '+1234567890', message: 'Hello' })).toBe(
			'SMSTO:+1234567890:Hello'
		);
	});

	it('produces SMSTO format without message', () => {
		expect(encodeSMS({ phone: '+1234567890' })).toBe('SMSTO:+1234567890');
	});

	it('produces SMSTO format with empty message string', () => {
		expect(encodeSMS({ phone: '+1234567890', message: '' })).toBe('SMSTO:+1234567890');
	});
});

describe('encodePhone', () => {
	it('produces tel: format', () => {
		expect(encodePhone('+1234567890')).toBe('tel:+1234567890');
	});

	it('works with unformatted numbers', () => {
		expect(encodePhone('5551234')).toBe('tel:5551234');
	});
});

describe('encodeText', () => {
	it('returns plain text unchanged', () => {
		expect(encodeText('Hello, world!')).toBe('Hello, world!');
	});

	it('returns empty string unchanged', () => {
		expect(encodeText('')).toBe('');
	});

	it('preserves special characters', () => {
		expect(encodeText('foo\nbar\ttab')).toBe('foo\nbar\ttab');
	});

	it('preserves unicode', () => {
		expect(encodeText('cafe\u0301')).toBe('cafe\u0301');
	});
});
