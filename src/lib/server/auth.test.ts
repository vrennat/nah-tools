import { describe, it, expect } from 'vitest';
import { hashPassphrase, verifyPassphrase } from '$server/auth';

describe('hashPassphrase', () => {
	it('returns a bcrypt hash', async () => {
		const hash = await hashPassphrase('my-secret');
		expect(hash).toMatch(/^\$2[aby]?\$/);
	});

	it('produces different hashes for the same input (salted)', async () => {
		const a = await hashPassphrase('same-input');
		const b = await hashPassphrase('same-input');
		expect(a).not.toBe(b);
	});
});

describe('verifyPassphrase', () => {
	it('returns true for the correct passphrase', async () => {
		const hash = await hashPassphrase('correct-pass');
		expect(await verifyPassphrase('correct-pass', hash)).toBe(true);
	});

	it('returns false for a wrong passphrase', async () => {
		const hash = await hashPassphrase('correct-pass');
		expect(await verifyPassphrase('wrong-pass', hash)).toBe(false);
	});

	it('round-trip: hash then verify succeeds', async () => {
		const passphrase = 'round-trip-test-phrase';
		const hash = await hashPassphrase(passphrase);
		const result = await verifyPassphrase(passphrase, hash);
		expect(result).toBe(true);
	});
});
