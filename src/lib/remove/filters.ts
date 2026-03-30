import type { Broker, BrokerFilters, ProgressEntry, RemovalStatus, SortBy } from './types';

const PRIORITY_ORDER = { crucial: 0, high: 1, medium: 2, low: 3 } as const;
const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2, 'manual-only': 3 } as const;

export function filterBrokers(brokers: Broker[], filters: BrokerFilters, progress: Record<string, ProgressEntry>): Broker[] {
	return brokers.filter((b) => {
		if (filters.method && filters.method !== 'all') {
			const method = b.optOutMethod;
			const match =
				method === filters.method ||
				(filters.method === 'email' && method === 'email+form') ||
				(filters.method === 'form' && method === 'email+form');
			if (!match) return false;
		}
		if (filters.difficulty && filters.difficulty !== 'all' && b.difficulty !== filters.difficulty)
			return false;
		if (filters.priority && filters.priority !== 'all' && b.priority !== filters.priority)
			return false;
		if (filters.category && filters.category !== 'all' && b.category !== filters.category)
			return false;
		if (filters.status && filters.status !== 'all') {
			const status: RemovalStatus = progress[b.id]?.status ?? 'not-started';
			if (status !== filters.status) return false;
		}
		return true;
	});
}

export function sortBrokers(
	brokers: Broker[],
	sortBy: SortBy,
	progress: Record<string, ProgressEntry>
): Broker[] {
	return [...brokers].sort((a, b) => {
		switch (sortBy) {
			case 'priority':
				return (
					PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
					DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]
				);
			case 'difficulty':
				return (
					DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty] ||
					PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
				);
			case 'name':
				return a.name.localeCompare(b.name);
			case 'status': {
				const statusOrder: Record<RemovalStatus, number> = {
					'not-started': 0,
					'email-sent': 1,
					'form-submitted': 2,
					'verification-pending': 3,
					confirmed: 4,
					skipped: 5
				};
				const sa = progress[a.id]?.status ?? 'not-started';
				const sb = progress[b.id]?.status ?? 'not-started';
				return statusOrder[sa] - statusOrder[sb];
			}
			default:
				return 0;
		}
	});
}
