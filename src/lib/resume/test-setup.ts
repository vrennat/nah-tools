import { vi, beforeEach } from 'vitest';

const store = new Map<string, unknown>();

vi.mock('idb-keyval', () => ({
	get: (key: string) => Promise.resolve(store.get(key)),
	set: (key: string, val: unknown) => {
		store.set(key, val);
		return Promise.resolve();
	},
	del: (key: string) => {
		store.delete(key);
		return Promise.resolve();
	},
	keys: () => Promise.resolve([...store.keys()]),
	clear: () => {
		store.clear();
		return Promise.resolve();
	}
}));

// Reset store between tests
beforeEach(() => {
	store.clear();
});
