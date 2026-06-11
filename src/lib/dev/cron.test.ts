import { describe, it, expect } from 'vitest';
import { parseCron, validateCron, nextRuns } from './cron';

describe('parseCron — n/step syntax', () => {
	it('5/15 in minutes means starting at 5, every 15 through 59', () => {
		const f = parseCron('5/15 * * * *');
		expect([...f.minute].sort((a, b) => a - b)).toEqual([5, 20, 35, 50]);
	});

	it('0/6 in hours means starting at 0, every 6 through 23', () => {
		const f = parseCron('0 0/6 * * *');
		expect([...f.hour].sort((a, b) => a - b)).toEqual([0, 6, 12, 18]);
	});

	it('1/10 in minutes means starting at 1, every 10 through 59', () => {
		const f = parseCron('1/10 * * * *');
		expect([...f.minute].sort((a, b) => a - b)).toEqual([1, 11, 21, 31, 41, 51]);
	});

	it('*/5 in minutes means every 5 starting from 0 (full range)', () => {
		const f = parseCron('*/5 * * * *');
		expect([...f.minute].sort((a, b) => a - b)).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
	});

	it('plain value without step still pins to a single value', () => {
		const f = parseCron('5 * * * *');
		expect([...f.minute]).toEqual([5]);
	});
});

describe('validateCron', () => {
	it('returns valid for a standard 5-field expression', () => {
		expect(validateCron('0 9 * * 1').valid).toBe(true);
	});

	it('returns invalid for wrong number of fields', () => {
		expect(validateCron('* * * *').valid).toBe(false);
	});

	it('returns invalid for out-of-range values', () => {
		expect(validateCron('60 * * * *').valid).toBe(false);
	});
});

describe('nextRuns', () => {
	it('returns the correct count of upcoming dates', () => {
		const from = new Date('2024-01-01T00:00:00Z');
		const runs = nextRuns('0 12 * * *', from, 3);
		expect(runs.length).toBe(3);
	});
});
