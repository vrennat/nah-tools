import { describe, it, expect } from 'vitest';
import { checkDestination, MAX_DESTINATION_LENGTH } from '$server/destination-policy';

const redirect = (url: string) => checkDestination(url, { forRedirect: true });

describe('checkDestination', () => {
	it.each([
		'https://example.com',
		'http://example.com/path?q=1',
		'https://sub.example.co.uk/a/b',
		'https://xn--bcher-kva.example/',
		'https://teams.microsoft.com/l/message/19:abc@unq.gbl.spaces/1?context=%7B%7D',
		'https://example.com./trailing-dot'
	])('allows %s', (url) => {
		expect(redirect(url)).toEqual({ ok: true });
	});

	it.each([
		['javascript:alert(1)', /http or https/],
		['data:text/html,hi', /http or https/],
		['ftp://example.com/file', /http or https/],
		['not a url', /Invalid URL/]
	])('rejects non-http(s) %s', (url, reason) => {
		const r = redirect(url);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.reason).toMatch(reason);
	});

	it.each([
		'http://127.0.0.1/',
		'http://10.0.0.1/',
		'http://169.254.169.254/latest/meta-data',
		'http://2130706433/',
		'http://0x7f.1/',
		'http://[::1]/',
		'http://[fd00::1]/',
		'http://localhost:8080/',
		'http://foo.localhost/'
	])('rejects IP-literal and local host %s', (url) => {
		expect(redirect(url).ok).toBe(false);
	});

	it('rejects embedded credentials', () => {
		const r = redirect('https://user:pw@example.com/');
		expect(r.ok).toBe(false);
	});

	it('rejects single-label and malformed hostnames', () => {
		expect(redirect('https://example/').ok).toBe(false);
		expect(redirect('https://exa_mple.com/').ok).toBe(false);
		expect(redirect('https://-bad.example.com/').ok).toBe(false);
	});

	it('rejects a hostname made of free text (seen in a phishing link)', () => {
		const r = redirect(
			'https://系统检测到您的账户尚未完成安全验证，因此目前处于受限状态。请在24小时内完成相关验证，否则账户可能被暂停。'
		);
		expect(r.ok).toBe(false);
	});

	it('rejects hostnames with too many labels', () => {
		expect(redirect(`https://${'a.'.repeat(25)}example.com/`).ok).toBe(false);
	});

	it('enforces the length cap', () => {
		const base = 'https://example.com/';
		expect(redirect(base + 'a'.repeat(MAX_DESTINATION_LENGTH - base.length)).ok).toBe(true);
		expect(redirect(base + 'a'.repeat(MAX_DESTINATION_LENGTH - base.length + 1)).ok).toBe(false);
	});

	it('blocks links back to nah.tools for redirects only', () => {
		for (const url of ['https://nah.tools/qr', 'https://go.nah.tools/abc', 'https://NAH.TOOLS/']) {
			expect(redirect(url).ok).toBe(false);
		}
		expect(checkDestination('https://nah.tools/qr', { forRedirect: false })).toEqual({ ok: true });
	});

	it('blocks other shorteners including subdomains', () => {
		expect(redirect('https://bit.ly/x').ok).toBe(false);
		expect(redirect('https://s.id/x').ok).toBe(false);
		expect(redirect('https://www.tinyurl.com/x').ok).toBe(false);
		// A domain that merely ends with the same letters is not a shortener.
		expect(redirect('https://habit.ly.example.com/').ok).toBe(true);
		expect(redirect('https://rabbit.ly/').ok).toBe(true);
	});

	it('blocks seed-listed campaign domains and their subdomains', () => {
		expect(redirect('https://sccjlej.com/').ok).toBe(false);
		expect(redirect('https://gwmlzgd.sccjlej.com/anything').ok).toBe(false);
		expect(redirect('https://oxfc.bgp09.icu/telegram').ok).toBe(false);
		expect(redirect('https://notsccjlej.com/').ok).toBe(true);
	});

	it('blocks the campaign landing path on any domain', () => {
		const r = redirect('https://brandnew.unseen-domain.com/wqamhcsom?r=y4V3sb&t=1');
		expect(r.ok).toBe(false);
		expect(redirect('https://brandnew.unseen-domain.com/WQAMHCSOM/?r=x').ok).toBe(false);
		expect(redirect('https://example.com/wqamhcsomething').ok).toBe(true);
	});

	it('blocks free-registration TLDs', () => {
		expect(redirect('https://example.tk/').ok).toBe(false);
	});
});
