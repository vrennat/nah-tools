import { describe, it, expect } from 'vitest';
import { handle } from './hooks.server';

type HandleArgs = Parameters<typeof handle>[0];

function run(status: number, locals: App.Locals) {
	return handle({
		event: { locals } as HandleArgs['event'],
		resolve: async () => new Response('x', { status })
	} as HandleArgs);
}

describe('handle Retry-After', () => {
	it('sets Retry-After on a 429 when the limiter recorded one', async () => {
		const res = await run(429, { retryAfter: 120 });
		expect(res.headers.get('Retry-After')).toBe('120');
	});

	it('leaves other responses alone', async () => {
		expect((await run(200, { retryAfter: 120 })).headers.get('Retry-After')).toBeNull();
		expect((await run(429, {})).headers.get('Retry-After')).toBeNull();
	});
});
