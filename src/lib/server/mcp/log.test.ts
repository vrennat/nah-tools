import { describe, it, expect, vi, afterEach } from 'vitest';
import { errorKind, logToolError } from './log';

afterEach(() => vi.restoreAllMocks());

describe('logToolError', () => {
	it('logs the tool and the error class, never the message', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		logToolError('pdf_merge', new TypeError('Invalid object in Confidential-Salaries-2026.pdf: /Title (Jane Doe)'));
		expect(spy).toHaveBeenCalledTimes(1);
		const line = spy.mock.calls[0][0] as string;
		expect(JSON.parse(line)).toEqual({ event: 'mcp_tool_error', tool: 'pdf_merge', error: 'TypeError' });
		expect(line).not.toMatch(/Jane|Salaries/);
	});

	it('does not log unknown class names or thrown strings, which can carry content', () => {
		class LeakyNameFromFile extends Error {}
		expect(errorKind(new LeakyNameFromFile('x'))).toBe('other');
		expect(errorKind('Bad xref at /Author (Jane Doe)')).toBe('other');
		expect(errorKind(undefined)).toBe('other');
	});
});
