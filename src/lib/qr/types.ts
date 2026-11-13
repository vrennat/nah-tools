/** All supported QR code content types */
export type QRType = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'phone' | 'sms';

/** Dot style options from qr-code-styling */
export type DotStyle = 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded';

/** Corner square style options */
export type CornerSquareStyle = 'square' | 'extra-rounded' | 'dot';

/** Corner dot style options */
export type CornerDotStyle = 'square' | 'dot';

/** Error correction levels */
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

/** Gradient types for foreground */
export type GradientType = 'linear' | 'radial';

export interface GradientConfig {
	type: GradientType;
	rotation?: number; // degrees, for linear
	colorStops: [string, string]; // [startColor, endColor]
}

export interface QRStyleOptions {
	foreground: string;
	background: string;
	gradient?: GradientConfig;
	dotStyle: DotStyle;
	cornerSquareStyle: CornerSquareStyle;
	cornerDotStyle: CornerDotStyle;
	errorCorrection: ErrorCorrectionLevel;
	logo?: string | null; // data URL or preset path
	logoSize?: number; // 0-1, fraction of QR area (default 0.2)
}

export interface WiFiData {
	ssid: string;
	password: string;
	encryption: 'WPA' | 'WEP' | 'nopass';
	hidden?: boolean;
}

export interface VCardData {
	firstName: string;
	lastName: string;
	phone?: string;
	email?: string;
	org?: string;
	title?: string;
	url?: string;
}

export interface EmailData {
	to: string;
	subject?: string;
	body?: string;
}

export interface SMSData {
	phone: string;
	message?: string;
}

/** Dynamic QR code record from D1 */
export interface DynamicCode {
	id: number;
	short_code: string;
	destination_url: string;
	label: string | null;
	passphrase_hash: string;
	scan_count: number;
	is_active: number;
	created_at: string;
	updated_at: string;
	expires_at: string | null;
	source: string;
	custom_alias: string | null;
	utm_source: string | null;
	utm_medium: string | null;
	utm_campaign: string | null;
	utm_term: string | null;
	utm_content: string | null;
}

/** Click log record from D1 */
export interface ClickLog {
	id: number;
	short_code: string;
	clicked_at: string;
	country: string | null;
	city: string | null;
	region: string | null;
	device_type: string | null;
	referer: string | null;
}

/** Aggregated click statistics */
export interface ClickStats {
	total: number;
	byCountry: { country: string; count: number }[];
	byDay: { date: string; count: number }[];
	byDevice: { device: string; count: number }[];
	byReferer: { referer: string; count: number }[];
}

/** UTM parameters */
export interface UTMParams {
	source?: string;
	medium?: string;
	campaign?: string;
	term?: string;
	content?: string;
}
