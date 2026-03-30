import type { ProgressData, ProgressEntry, RemovalStatus } from './types';

const STORAGE_KEY = 'nah-remove-progress';
const CURRENT_VERSION = 1;

function createEmpty(): ProgressData {
	return { version: CURRENT_VERSION, brokers: {} };
}

export function loadProgress(): Record<string, ProgressEntry> {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const data: ProgressData = JSON.parse(raw);
		if (data.version !== CURRENT_VERSION) return {};
		return data.brokers;
	} catch {
		return {};
	}
}

export function updateProgress(brokerId: string, status: RemovalStatus): void {
	const data = loadAll();
	data.brokers[brokerId] = {
		status,
		updatedAt: new Date().toISOString()
	};
	localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearProgress(): void {
	localStorage.removeItem(STORAGE_KEY);
}

export function exportProgress(): string {
	return JSON.stringify(loadAll(), null, 2);
}

function loadAll(): ProgressData {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return createEmpty();
		const data: ProgressData = JSON.parse(raw);
		if (data.version !== CURRENT_VERSION) return createEmpty();
		return data;
	} catch {
		return createEmpty();
	}
}
