import { describe, it, expect } from 'vitest';
import { isHttpError } from '@sveltejs/kit';
import { readJson } from '$server/http';

const req = (body: string) => new Request('http://x/', { method: 'POST', body });

describe('readJson', () => {
	it('parses valid JSON', async () => {
		expect(await readJson(req('{"a":1}'))).toEqual({ a: 1 });
	});

	it('throws 400 on malformed JSON', async () => {
		const e = await readJson(req('{nope')).catch((x) => x);
		expect(isHttpError(e, 400)).toBe(true);
	});

	it('throws 400 on empty body', async () => {
		const e = await readJson(req('')).catch((x) => x);
		expect(isHttpError(e, 400)).toBe(true);
	});
});
