import { get, set, del } from 'idb-keyval';
import type {
	InvoiceData,
	InvoiceMetadata,
	SenderProfile,
	SavedClient,
	NumberingCounters,
	DocumentType
} from './types';
import { createId, createDefaultCounters, DOCUMENT_PREFIXES } from './types';
import { calculateInvoiceSummary } from './calculations';

// ──── Invoice CRUD ────

const INVOICE_INDEX = 'invoice-index';

function invoiceKey(id: string): string {
	return `invoice:${id}`;
}

function toMetadata(data: InvoiceData): InvoiceMetadata {
	const summary = calculateInvoiceSummary(data);
	return {
		id: data.id,
		documentType: data.documentType,
		documentNumber: data.documentNumber,
		template: data.template,
		clientName: data.client.name,
		currency: data.currency,
		total: summary.total,
		updatedAt: data.updatedAt
	};
}

async function getIndex(): Promise<InvoiceMetadata[]> {
	return (await get<InvoiceMetadata[]>(INVOICE_INDEX)) ?? [];
}

async function setIndex(index: InvoiceMetadata[]): Promise<void> {
	await set(INVOICE_INDEX, index);
}

export async function saveInvoice(data: InvoiceData): Promise<InvoiceData> {
	await set(invoiceKey(data.id), data);
	const index = await getIndex();
	const existing = index.findIndex((m) => m.id === data.id);
	const meta = toMetadata(data);
	if (existing >= 0) {
		index[existing] = meta;
	} else {
		index.push(meta);
	}
	await setIndex(index);
	return data;
}

export async function getInvoice(id: string): Promise<InvoiceData | undefined> {
	return get<InvoiceData>(invoiceKey(id));
}

export async function listInvoices(): Promise<InvoiceMetadata[]> {
	return getIndex();
}

export async function deleteInvoice(id: string): Promise<void> {
	await del(invoiceKey(id));
	const index = await getIndex();
	await setIndex(index.filter((m) => m.id !== id));
}

// ──── Sender Profiles ────

const PROFILES_KEY = 'invoice-sender-profiles';

export async function listProfiles(): Promise<SenderProfile[]> {
	return (await get<SenderProfile[]>(PROFILES_KEY)) ?? [];
}

export async function saveProfile(profile: SenderProfile): Promise<void> {
	const profiles = await listProfiles();
	const idx = profiles.findIndex((p) => p.id === profile.id);
	if (idx >= 0) {
		profiles[idx] = profile;
	} else {
		profiles.push(profile);
	}
	await set(PROFILES_KEY, profiles);
}

export async function deleteProfile(id: string): Promise<void> {
	const profiles = await listProfiles();
	await set(
		PROFILES_KEY,
		profiles.filter((p) => p.id !== id)
	);
}

// ──── Client Directory ────

const CLIENTS_KEY = 'invoice-client-directory';

export async function listClients(): Promise<SavedClient[]> {
	return (await get<SavedClient[]>(CLIENTS_KEY)) ?? [];
}

export async function saveClient(client: SavedClient): Promise<void> {
	const clients = await listClients();
	const idx = clients.findIndex((c) => c.id === client.id);
	if (idx >= 0) {
		clients[idx] = client;
	} else {
		clients.push(client);
	}
	await set(CLIENTS_KEY, clients);
}

export async function deleteClient(id: string): Promise<void> {
	const clients = await listClients();
	await set(
		CLIENTS_KEY,
		clients.filter((c) => c.id !== id)
	);
}

// ──── Numbering Counters ────

const COUNTERS_KEY = 'invoice-counters';

export async function getCounters(): Promise<NumberingCounters> {
	return (await get<NumberingCounters>(COUNTERS_KEY)) ?? createDefaultCounters();
}

export async function nextDocumentNumber(docType: DocumentType): Promise<string> {
	const counters = await getCounters();
	counters[docType] += 1;
	await set(COUNTERS_KEY, counters);
	const prefix = DOCUMENT_PREFIXES[docType];
	return `${prefix}-${String(counters[docType]).padStart(4, '0')}`;
}

// ──── JSON Import/Export ────

export async function exportInvoiceJSON(id: string): Promise<string> {
	const data = await getInvoice(id);
	if (!data) throw new Error(`Invoice not found: ${id}`);
	return JSON.stringify(data, null, 2);
}

export async function importInvoiceJSON(json: string): Promise<InvoiceData> {
	let parsed: unknown;
	try {
		parsed = JSON.parse(json);
	} catch {
		throw new Error('Invalid JSON');
	}

	if (
		typeof parsed !== 'object' ||
		parsed === null ||
		!('sender' in parsed) ||
		!('client' in parsed) ||
		!('lineItems' in parsed)
	) {
		throw new Error('Missing required invoice fields');
	}

	const data = parsed as InvoiceData;
	const now = new Date().toISOString();
	const imported: InvoiceData = {
		...data,
		id: createId(),
		createdAt: now,
		updatedAt: now
	};

	await saveInvoice(imported);
	return imported;
}
