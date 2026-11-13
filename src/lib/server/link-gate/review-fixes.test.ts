/** Behaviour added after the adversarial review: redirect forms, unreadable pages, UTM, and linear-time parsing. */
import { describe, it, expect, vi } from 'vitest';
import { followChain, findClientRedirect } from './fetch-chain';
import { summarizePage } from './extract';
import { judgeDestination } from './index';
import { servedUrl } from './route';
import { NOUL_QUESTIONS } from './questions';

type Route = { status?: number; headers?: Record<string, string>; body?: string };
function fakeFetch(routes: Record<string, Route>) {
	const calls: string[] = [];
	const impl = (async (input: RequestInfo | URL) => {
		const url = String(input);
		calls.push(url);
		const r = routes[url];
		if (!r) throw new TypeError(`network error: ${url}`);
		return new Response(r.body ?? '', { status: r.status ?? 200, headers: { 'content-type': 'text/html', ...r.headers } });
	}) as typeof fetch;
	return { impl, calls };
}
const content = `<title>Land</title><p>${'Real content here. '.repeat(40)}</p>`;
const clef = (probs: Partial<Record<keyof typeof NOUL_QUESTIONS, number>> = {}) => ({
	run: vi.fn(async () => ({
		answers: {
			...Object.fromEntries(Object.keys(NOUL_QUESTIONS).map((id) => [id, { noul: probs[id as keyof typeof NOUL_QUESTIONS] ?? 0.02 }])),
			site_type: { choice: 'other' }
		}
	}))
});

describe('redirect forms browsers follow', () => {
	it('follows a Refresh header on a 200 response', async () => {
		const { impl } = fakeFetch({
			'https://a.example/': { headers: { refresh: '0; url=https://b.example/' }, body: 'hi' },
			'https://b.example/': { body: content }
		});
		expect((await followChain('https://a.example/', { fetchImpl: impl })).finalUrl).toBe('https://b.example/');
	});

	it('reads the page when a Refresh header only reloads it', async () => {
		const { impl } = fakeFetch({ 'https://a.example/': { headers: { refresh: '30' }, body: content } });
		const r = await followChain('https://a.example/', { fetchImpl: impl });
		expect(r.outcome).toBe('page');
		expect(r.body).toContain('Real content');
	});

	it.each([
		['no url=', '<meta http-equiv="refresh" content="0;https://b.example/">'],
		['fractional delay', '<meta http-equiv="Refresh" content="0.0; URL=\'https://b.example/\'">'],
		['content before http-equiv', '<meta content="1; url=https://b.example/" http-equiv="refresh">'],
		['after 70 KB of comment padding', `<!--${'x'.repeat(70_000)}--><meta http-equiv="refresh" content="0;url=https://b.example/">`]
	])('finds a meta refresh with %s', (_n, html) => {
		expect(findClientRedirect(html)?.url).toBe('https://b.example/');
	});

	it('ignores a meta refresh inside a comment', () => {
		expect(findClientRedirect('<!-- <meta http-equiv="refresh" content="0;url=https://b.example/"> -->')).toBeNull();
	});

	it('reads SVG pages and follows a script redirect in them', async () => {
		const { impl } = fakeFetch({
			'https://a.example/x.svg': {
				headers: { 'content-type': 'image/svg+xml' },
				body: '<svg xmlns="http://www.w3.org/2000/svg"><script>location.href="https://b.example/"</script></svg>'
			},
			'https://b.example/': { body: content }
		});
		expect((await followChain('https://a.example/x.svg', { fetchImpl: impl })).finalUrl).toBe('https://b.example/');
	});

	it('does not fetch a hop on a non-standard port', async () => {
		const { impl, calls } = fakeFetch({ 'https://a.example/': { status: 302, headers: { location: 'https://b.example:6379/' } } });
		const r = await followChain('https://a.example/', { fetchImpl: impl });
		expect(r.outcome).toBe('fetch-failed');
		expect(calls).toEqual(['https://a.example/']);
	});
});

describe('decoy redirects (review pass 2)', () => {
	const login = `<title>Sign in</title><form action="/p"><input type="email" name="u"><input type="password" name="p"></form>`;
	it.each([
		['meta refresh inside a script string', `${login}<script>var s='<meta http-equiv="refresh" content="0;url=https://b.example/">'</script>`],
		['meta refresh inside <template>', `${login}<template><meta http-equiv="refresh" content="0;url=https://b.example/"></template>`],
		['dead-branch script redirect', `${login}<script>if(false) location.href="https://b.example/"</script>`]
	])('does not follow a %s', (_n, html) => {
		expect(findClientRedirect(html)).toBeNull();
	});

	it('follows a slow refresh on a loader page, but no Refresh header on a content page', async () => {
		expect(findClientRedirect('<meta http-equiv="refresh" content="6;url=https://b.example/">')?.url).toBe(
			'https://b.example/'
		);
		expect(findClientRedirect('<meta http-equiv="refresh" content=".;url=https://b.example/">')?.url).toBe(
			'https://b.example/'
		);
		const { impl, calls } = fakeFetch({
			'https://c.example/': { headers: { refresh: '0; url=https://b.example/' }, body: content }
		});
		expect((await followChain('https://c.example/', { fetchImpl: impl })).finalUrl).toBe('https://c.example/');
		expect(calls).not.toContain('https://b.example/');
	});

	it.each([
		['inside <template>', '<template><input name="x"></template>'],
		['inside a script string', '<script>var s="<input>"</script>'],
		['with the hidden attribute', '<input type=text hidden>']
	])('treats a page whose only input is %s as a loader', (_n, extra) => {
		expect(findClientRedirect(`${extra}<script>location.href="https://b.example/"</script>`)?.url).toBe(
			'https://b.example/'
		);
	});

	it('judges a decoy loader page on its own and keeps the worst verdict', async () => {
		// The model flags only the casino page; the chain ends on a clean page.
		const ai = {
			run: vi.fn(async (_m: string, input: unknown) => {
				const casino = /Finally: https:\/\/casino\.example/.test((input as { state: string }).state)
					|| /Final URL: https:\/\/casino\.example/.test((input as { state: string }).state);
				return clef(casino ? { scam: 0.95, gambling: 0.95, urgency: 0.9 } : {}).run();
			})
		};
		const { impl } = fakeFetch({
			'https://casino.example/': {
				body: '<title>Bonus</title><img src="/banner.png" alt="Bonus"><script>if(0)location.href="https://en.wikipedia.org/"</script>'
			},
			'https://en.wikipedia.org/': { body: content }
		});
		const d = await judgeDestination('https://casino.example/', { ai, fetchImpl: impl });
		expect(ai.run).toHaveBeenCalledTimes(2);
		expect(d.verdict).toBe('block');
	});

	it('holds when any one of the page judgements fails', async () => {
		let n = 0;
		const ai = { run: vi.fn(async () => (n++ === 0 ? clef().run() : Promise.reject(new Error('down')))) };
		const { impl } = fakeFetch({
			'https://a.example/': { body: '<script>location.href="https://b.example/"</script>' },
			'https://b.example/': { body: content }
		});
		const d = await judgeDestination('https://a.example/', { ai, fetchImpl: impl });
		expect(d).toMatchObject({ verdict: 'hold', holdReason: 'unchecked' });
	});

	it('holds a blank page the model calls a redirect when none was found to follow', async () => {
		const { impl } = fakeFetch({ 'https://a.example/': { body: '<title></title><div id=app></div>' } });
		const d = await judgeDestination('https://a.example/', { ai: clef({ redirector: 0.8 }), fetchImpl: impl });
		expect(d).toMatchObject({ verdict: 'hold', holdReason: 'suspicious' });
	});

	it('does not apply that rule to a content page or a non-200 page', async () => {
		const { impl } = fakeFetch({
			'https://a.example/': { body: content },
			'https://b.example/': { status: 403, body: 'Just a moment...' }
		});
		expect(await judgeDestination('https://a.example/', { ai: clef({ redirector: 0.8 }), fetchImpl: impl })).toEqual({
			verdict: 'allow'
		});
		expect(await judgeDestination('https://b.example/', { ai: clef({ redirector: 0.8 }), fetchImpl: impl })).toEqual({
			verdict: 'allow'
		});
	});

	it('shows the model the loader page it passed through', async () => {
		const ai = clef();
		const { impl } = fakeFetch({
			'https://a.example/': { body: '<title>Please wait</title><p>Verifying your account</p><script>location.href="https://b.example/"</script>' },
			'https://b.example/': { body: content }
		});
		await judgeDestination('https://a.example/', { ai, fetchImpl: impl });
		const state = (ai.run.mock.calls[0] as unknown as [string, { state: string }])[1].state;
		expect(state).toContain('Title: Please wait');
		expect(state).toContain('Verifying your account');
	});
});

describe('parser evasions (review pass 2)', () => {
	const refresh = '<meta http-equiv="refresh" content="0;url=https://b.example/">';
	it.each([
		['after an abruptly closed comment <!-->', `<!-->${refresh}`],
		['after an abruptly closed comment <!--->', `<!--->${refresh}`],
		['after a comment closed with --!>', `<!-- x --!>${refresh}`],
		['after 201 other meta tags', `${'<meta name="x" content="y">'.repeat(201)}${refresh}`],
		['with http-equiv after 3 KB of attributes', `<meta data-x="${'a'.repeat(3000)}" http-equiv="refresh" content="0;url=https://b.example/">`],
		['with a newline inside the URL', '<meta http-equiv="refresh" content="0;url=https://b.exa\nmple/">']
	])('finds a refresh %s', (_n, html) => {
		expect(findClientRedirect(html)?.url).toBe('https://b.example/');
	});

	it('finds a script redirect after 51 other scripts', () => {
		const html = `${'<script>var a=1</script>'.repeat(51)}<script>location.href="https://b.example/"</script>`;
		expect(findClientRedirect(html)?.url).toBe('https://b.example/');
	});

	it('passes SVG text to the model', () => {
		const s = summarizePage('<svg><text>Your account is suspended</text></svg>', 'https://a.example/x.svg');
		expect(s.text).toContain('Your account is suspended');
	});
});

describe('unreadable destinations', () => {
	it('holds when the page cannot be fetched, even if the model would allow it', async () => {
		const ai = clef({ scam: 0.1, empty: 0.9 });
		const d = await judgeDestination('https://down.example/', { ai, fetchImpl: fakeFetch({}).impl });
		expect(d).toMatchObject({ verdict: 'hold', holdReason: 'unreadable' });
		expect(ai.run).not.toHaveBeenCalled();
	});

	it('holds a redirect to another host that answers the checker with 403', async () => {
		const { impl } = fakeFetch({
			'https://short.example/': { status: 302, headers: { location: 'https://land.example/' } },
			'https://land.example/': { status: 403, body: 'Forbidden' }
		});
		const d = await judgeDestination('https://short.example/', { ai: clef(), fetchImpl: impl });
		expect(d).toMatchObject({ verdict: 'hold', holdReason: 'unreadable' });
	});

	it('holds a redirect to another host that the model calls empty', async () => {
		const { impl } = fakeFetch({
			'https://short.example/': { status: 302, headers: { location: 'https://land.example/' } },
			'https://land.example/': { body: content }
		});
		const d = await judgeDestination('https://short.example/', { ai: clef({ empty: 0.8 }), fetchImpl: impl });
		expect(d).toMatchObject({ verdict: 'hold', holdReason: 'unreadable' });
	});

	it('lets the model judge a site that refuses the checker on its own URL (known cloaking gap)', async () => {
		const { impl } = fakeFetch({ 'https://big.example/': { status: 403, body: 'Access Denied' } });
		const d = await judgeDestination('https://big.example/', { ai: clef({ empty: 0.9 }), fetchImpl: impl });
		expect(d).toEqual({ verdict: 'allow' });
	});

	it('treats www and the bare domain as the same host', async () => {
		const { impl } = fakeFetch({
			'https://example.com/': { status: 301, headers: { location: 'https://www.example.com/' } },
			'https://www.example.com/': { status: 403, body: 'Access Denied' }
		});
		const d = await judgeDestination('https://example.com/', { ai: clef({ empty: 0.9 }), fetchImpl: impl });
		expect(d).toEqual({ verdict: 'allow' });
	});
});

describe('servedUrl', () => {
	it('matches what the redirect worker sends visitors to', () => {
		expect(servedUrl('https://a.example/p?x=1', { content: 'v2', source: 'nl' })).toBe(
			'https://a.example/p?x=1&utm_source=nl&utm_content=v2'
		);
		// Keys the worker never stores are not part of the judged URL.
		expect(servedUrl('https://a.example/', { content: 'a', evil: 'x' } as never)).toBe(
			'https://a.example/?utm_content=a'
		);
		expect(servedUrl('https://a.example/', undefined)).toBe('https://a.example/');
	});

	it('gates the URL with UTM parameters, so a redirector branching on them is seen', async () => {
		const { impl, calls } = fakeFetch({ 'https://a.example/?utm_content=x': { body: content } });
		await judgeDestination(servedUrl('https://a.example/', { content: 'x' }), { ai: clef(), fetchImpl: impl });
		expect(calls).toEqual(['https://a.example/?utm_content=x']);
	});
});

describe('linear-time parsing of hostile pages', () => {
	const KB256 = 256 * 1024;
	it.each([
		['unclosed <script', '<script '.repeat(KB256 / 8)],
		['unclosed <title', '<title>'.repeat(KB256 / 7)],
		['bare <', '<'.repeat(KB256)],
		['unclosed <form', '<form '.repeat(KB256 / 6)],
		['unclosed <meta', '<meta http-equiv=refresh '.repeat(KB256 / 25)],
		['many inputs', '<form><input '.repeat(KB256 / 13)]
	])('handles 256 KB of %s quickly', (_n, html) => {
		const t = performance.now();
		summarizePage(html, 'https://a.example/');
		findClientRedirect(html);
		// Quadratic scanning of the same input took seconds before; this leaves room for slow CI.
		expect(performance.now() - t).toBeLessThan(500);
	});
});
