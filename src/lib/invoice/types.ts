// ──── Document Types ────

export type DocumentType = 'invoice' | 'credit_note' | 'estimate' | 'receipt' | 'proforma';

export type InvoiceTemplateId = 'clean' | 'classic' | 'bold';

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
	invoice: 'Invoice',
	credit_note: 'Credit Note',
	estimate: 'Estimate',
	receipt: 'Receipt',
	proforma: 'Proforma'
};

export const DOCUMENT_PREFIXES: Record<DocumentType, string> = {
	invoice: 'INV',
	credit_note: 'CN',
	estimate: 'EST',
	receipt: 'REC',
	proforma: 'PRO'
};

// ──── Currency ────

export interface CurrencyDef {
	code: string;
	symbol: string;
	name: string;
	locale: string;
	decimals: number;
}

// ──── Tax ────

export type TaxMode = 'none' | 'single' | 'multi' | 'compound';

export interface TaxLine {
	id: string;
	name: string;
	rate: number;
	isCompound: boolean;
}

export interface TaxConfig {
	mode: TaxMode;
	taxLines: TaxLine[];
	pricesIncludeTax: boolean;
	reverseCharge: boolean;
}

// ──── Line Items ────

export type UnitType =
	| 'hours'
	| 'days'
	| 'pieces'
	| 'items'
	| 'units'
	| 'pages'
	| 'words'
	| 'kg'
	| 'lbs'
	| 'meters'
	| 'feet'
	| 'custom';

export const UNIT_LABELS: Record<UnitType, string> = {
	hours: 'hrs',
	days: 'days',
	pieces: 'pcs',
	items: 'items',
	units: 'units',
	pages: 'pages',
	words: 'words',
	kg: 'kg',
	lbs: 'lbs',
	meters: 'm',
	feet: 'ft',
	custom: ''
};

export type DiscountType = 'percentage' | 'fixed';

export type LineItemCategory = 'labor' | 'materials' | 'other';

export interface LineItem {
	id: string;
	description: string;
	quantity: number;
	unitType: UnitType;
	customUnit: string;
	unitPrice: number;
	discountType: DiscountType;
	discountValue: number;
	taxRateOverride: number | null;
	category: LineItemCategory;
	sortOrder: number;
}

// ──── Contact Info ────

export interface ContactInfo {
	name: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
	taxId: string;
	website: string;
}

// ──── Payment Info ────

export interface PaymentInfo {
	bankName: string;
	accountName: string;
	accountNumber: string;
	routingNumber: string;
	iban: string;
	swift: string;
	paypalEmail: string;
	customInstructions: string;
}

// ──── Main Invoice Document ────

export interface InvoiceData {
	id: string;
	documentType: DocumentType;
	template: InvoiceTemplateId;
	documentNumber: string;
	referenceNumber: string;
	sender: ContactInfo;
	client: ContactInfo;
	logoDataUrl: string;
	issueDate: string;
	dueDate: string;
	currency: string;
	taxConfig: TaxConfig;
	lineItems: LineItem[];
	discountType: DiscountType;
	discountValue: number;
	notes: string;
	terms: string;
	paymentInfo: PaymentInfo;
	createdAt: string;
	updatedAt: string;
}

// ──── Index metadata ────

export interface InvoiceMetadata {
	id: string;
	documentType: DocumentType;
	documentNumber: string;
	template: InvoiceTemplateId;
	clientName: string;
	currency: string;
	total: number;
	updatedAt: string;
}

// ──── Saved entities ────

export interface SenderProfile {
	id: string;
	name: string;
	sender: ContactInfo;
	logoDataUrl: string;
	paymentInfo: PaymentInfo;
	defaultCurrency: string;
	defaultTaxConfig: TaxConfig;
}

export interface SavedClient {
	id: string;
	client: ContactInfo;
	notes: string;
}

export interface NumberingCounters {
	invoice: number;
	credit_note: number;
	estimate: number;
	receipt: number;
	proforma: number;
}

// ──── Factory functions ────

export function createId(): string {
	return crypto.randomUUID();
}

export function createEmptyContact(): ContactInfo {
	return {
		name: '',
		email: '',
		phone: '',
		address: '',
		city: '',
		state: '',
		postalCode: '',
		country: '',
		taxId: '',
		website: ''
	};
}

export function createEmptyPaymentInfo(): PaymentInfo {
	return {
		bankName: '',
		accountName: '',
		accountNumber: '',
		routingNumber: '',
		iban: '',
		swift: '',
		paypalEmail: '',
		customInstructions: ''
	};
}

export function createEmptyLineItem(sortOrder: number = 0): LineItem {
	return {
		id: createId(),
		description: '',
		quantity: 1,
		unitType: 'items',
		customUnit: '',
		unitPrice: 0,
		discountType: 'percentage',
		discountValue: 0,
		taxRateOverride: null,
		category: 'other',
		sortOrder
	};
}

export function createDefaultTaxConfig(): TaxConfig {
	return {
		mode: 'none',
		taxLines: [{ id: createId(), name: 'Tax', rate: 10, isCompound: false }],
		pricesIncludeTax: false,
		reverseCharge: false
	};
}

export function createDefaultCounters(): NumberingCounters {
	return {
		invoice: 0,
		credit_note: 0,
		estimate: 0,
		receipt: 0,
		proforma: 0
	};
}

function todayISO(): string {
	return new Date().toISOString().slice(0, 10);
}

function thirtyDaysLaterISO(): string {
	const d = new Date();
	d.setDate(d.getDate() + 30);
	return d.toISOString().slice(0, 10);
}

export function createEmptyInvoice(docType: DocumentType = 'invoice'): InvoiceData {
	const now = new Date().toISOString();
	return {
		id: createId(),
		documentType: docType,
		template: 'clean',
		documentNumber: '',
		referenceNumber: '',
		sender: createEmptyContact(),
		client: createEmptyContact(),
		logoDataUrl: '',
		issueDate: todayISO(),
		dueDate: thirtyDaysLaterISO(),
		currency: 'USD',
		taxConfig: createDefaultTaxConfig(),
		lineItems: [createEmptyLineItem(0)],
		discountType: 'percentage',
		discountValue: 0,
		notes: '',
		terms: '',
		paymentInfo: createEmptyPaymentInfo(),
		createdAt: now,
		updatedAt: now
	};
}

export function createEmptySenderProfile(): SenderProfile {
	return {
		id: createId(),
		name: '',
		sender: createEmptyContact(),
		logoDataUrl: '',
		paymentInfo: createEmptyPaymentInfo(),
		defaultCurrency: 'USD',
		defaultTaxConfig: createDefaultTaxConfig()
	};
}

export function createEmptyClient(): SavedClient {
	return {
		id: createId(),
		client: createEmptyContact(),
		notes: ''
	};
}
