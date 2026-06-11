import { describe, it, expect } from 'vitest';
import { toTxt, toSrt, toVtt, formatSrtTimestamp, formatVttTimestamp } from './formats';
import type { TranscriptChunk } from './types';

// ---------------------------------------------------------------------------
// Timestamp formatting
// ---------------------------------------------------------------------------

describe('formatSrtTimestamp', () => {
	it('formats sub-second correctly', () => {
		expect(formatSrtTimestamp(0.5)).toBe('00:00:00,500');
	});

	it('formats exactly 1 hour', () => {
		expect(formatSrtTimestamp(3600)).toBe('01:00:00,000');
	});

	it('formats a typical mid-stream timestamp', () => {
		expect(formatSrtTimestamp(125.25)).toBe('00:02:05,250');
	});

	it('uses a comma as the decimal separator', () => {
		expect(formatSrtTimestamp(1.1)).toContain(',');
	});
});

describe('formatVttTimestamp', () => {
	it('formats sub-second correctly', () => {
		expect(formatVttTimestamp(0.5)).toBe('00:00:00.500');
	});

	it('formats exactly 1 hour', () => {
		expect(formatVttTimestamp(3600)).toBe('01:00:00.000');
	});

	it('uses a period as the decimal separator', () => {
		expect(formatVttTimestamp(1.1)).toContain('.');
		expect(formatVttTimestamp(1.1)).not.toContain(',');
	});
});

// ---------------------------------------------------------------------------
// toTxt
// ---------------------------------------------------------------------------

describe('toTxt', () => {
	it('happy path: joins trimmed chunk text with newlines', () => {
		const chunks: TranscriptChunk[] = [
			{ text: ' Hello world ', timestamp: [0, 3] },
			{ text: 'Goodbye.', timestamp: [3, 6] }
		];
		expect(toTxt(chunks)).toBe('Hello world\nGoodbye.');
	});

	it('returns empty string for empty input', () => {
		expect(toTxt([])).toBe('');
	});

	it('skips chunks with only whitespace', () => {
		const chunks: TranscriptChunk[] = [
			{ text: '   ', timestamp: [0, 1] },
			{ text: 'Real text', timestamp: [1, 2] }
		];
		expect(toTxt(chunks)).toBe('Real text');
	});
});

// ---------------------------------------------------------------------------
// toSrt
// ---------------------------------------------------------------------------

describe('toSrt', () => {
	it('happy path: produces valid SRT with 1-based index', () => {
		const chunks: TranscriptChunk[] = [
			{ text: 'Hello', timestamp: [0, 2.5] },
			{ text: 'World', timestamp: [2.5, 5] }
		];
		const result = toSrt(chunks);
		expect(result).toContain('1\n');
		expect(result).toContain('2\n');
		expect(result).toContain('00:00:00,000 --> 00:00:02,500');
		expect(result).toContain('00:00:02,500 --> 00:00:05,000');
		expect(result).toContain('Hello');
		expect(result).toContain('World');
	});

	it('returns empty string for empty input', () => {
		expect(toSrt([])).toBe('');
	});

	it('handles null end timestamp with fallback delta', () => {
		const chunks: TranscriptChunk[] = [{ text: 'Final chunk', timestamp: [10, null] }];
		const result = toSrt(chunks);
		// Should use start + 5s = 15s
		expect(result).toContain('00:00:10,000 --> 00:00:15,000');
	});

	it('skips blank chunks and does not increment index', () => {
		const chunks: TranscriptChunk[] = [
			{ text: '', timestamp: [0, 1] },
			{ text: 'Real', timestamp: [1, 2] }
		];
		const result = toSrt(chunks);
		// First cue should have index 1 (the empty one was skipped)
		expect(result.startsWith('1\n')).toBe(true);
		expect(result).not.toContain('2\n');
	});

	it('uses commas not periods in timestamps', () => {
		const chunks: TranscriptChunk[] = [{ text: 'Test', timestamp: [0, 1.5] }];
		const result = toSrt(chunks);
		expect(result).toContain(',');
		// The --> line should not contain a period-based timestamp
		const arrowLine = result.split('\n')[1];
		expect(arrowLine).not.toContain('.');
	});
});

// ---------------------------------------------------------------------------
// toVtt
// ---------------------------------------------------------------------------

describe('toVtt', () => {
	it('starts with WEBVTT header', () => {
		const result = toVtt([]);
		expect(result.startsWith('WEBVTT')).toBe(true);
	});

	it('happy path: produces valid VTT with period timestamps', () => {
		const chunks: TranscriptChunk[] = [{ text: 'Hello', timestamp: [0, 3] }];
		const result = toVtt(chunks);
		expect(result).toContain('00:00:00.000 --> 00:00:03.000');
		expect(result).toContain('Hello');
	});

	it('handles null end timestamp with fallback delta', () => {
		const chunks: TranscriptChunk[] = [{ text: 'Ending', timestamp: [20, null] }];
		const result = toVtt(chunks);
		expect(result).toContain('00:00:20.000 --> 00:00:25.000');
	});

	it('returns only WEBVTT header for empty input', () => {
		const result = toVtt([]);
		// Only the header and trailing blank line
		expect(result.trim()).toBe('WEBVTT');
	});

	it('uses periods not commas in timestamps', () => {
		const chunks: TranscriptChunk[] = [{ text: 'Test', timestamp: [1, 2] }];
		const result = toVtt(chunks);
		const arrowLine = result.split('\n').find((l) => l.includes('-->'))!;
		expect(arrowLine).toContain('.');
		expect(arrowLine).not.toContain(',');
	});
});
