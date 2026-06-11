/**
 * Pure conversion functions from Whisper output chunks to text/SRT/VTT formats.
 * No external dependencies — safe to import in tests without a DOM.
 */

import type { TranscriptChunk } from './types';

// Whisper sometimes emits null for the end timestamp of the final chunk.
// We fall back to start + this delta (seconds) so the cue still renders.
const NULL_END_DELTA = 5;

/**
 * Formats seconds as HH:MM:SS,mmm for SRT (comma decimal separator).
 */
export function formatSrtTimestamp(seconds: number): string {
	const totalMs = Math.max(0, Math.round(seconds * 1000));
	const ms = totalMs % 1000;
	const totalSec = Math.floor(totalMs / 1000);
	const sec = totalSec % 60;
	const totalMin = Math.floor(totalSec / 60);
	const min = totalMin % 60;
	const hr = Math.floor(totalMin / 60);
	return (
		String(hr).padStart(2, '0') +
		':' +
		String(min).padStart(2, '0') +
		':' +
		String(sec).padStart(2, '0') +
		',' +
		String(ms).padStart(3, '0')
	);
}

/**
 * Formats seconds as HH:MM:SS.mmm for VTT (period decimal separator).
 */
export function formatVttTimestamp(seconds: number): string {
	// Reuse SRT formatting then swap the comma for a period.
	return formatSrtTimestamp(seconds).replace(',', '.');
}

/**
 * Plain text: one line per chunk, stripped of leading/trailing whitespace.
 * Empty chunks are omitted.
 */
export function toTxt(chunks: TranscriptChunk[]): string {
	return chunks
		.map((c) => c.text.trim())
		.filter((t) => t.length > 0)
		.join('\n');
}

/**
 * SubRip (.srt) format: 1-based sequential index, HH:MM:SS,mmm timestamps,
 * cue text, blank line separator.
 */
export function toSrt(chunks: TranscriptChunk[]): string {
	const cues: string[] = [];
	let index = 1;
	for (const chunk of chunks) {
		const text = chunk.text.trim();
		if (!text) continue;
		const start = chunk.timestamp[0];
		const end = chunk.timestamp[1] ?? start + NULL_END_DELTA;
		cues.push(
			`${index}\n${formatSrtTimestamp(start)} --> ${formatSrtTimestamp(end)}\n${text}`
		);
		index++;
	}
	return cues.join('\n\n');
}

/**
 * WebVTT (.vtt) format: WEBVTT header, HH:MM:SS.mmm timestamps.
 * Cue identifiers use the 1-based index for easy reference.
 */
export function toVtt(chunks: TranscriptChunk[]): string {
	const lines: string[] = ['WEBVTT', ''];
	let index = 1;
	for (const chunk of chunks) {
		const text = chunk.text.trim();
		if (!text) continue;
		const start = chunk.timestamp[0];
		const end = chunk.timestamp[1] ?? start + NULL_END_DELTA;
		lines.push(
			`${index}\n${formatVttTimestamp(start)} --> ${formatVttTimestamp(end)}\n${text}`,
			''
		);
		index++;
	}
	return lines.join('\n');
}
