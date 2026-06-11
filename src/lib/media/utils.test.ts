import { describe, it, expect } from 'vitest';
import { getMediaExtension } from './utils';

function makeFile(name: string, type: string) {
	return { name, type };
}

describe('getMediaExtension', () => {
	describe('happy path', () => {
		it('returns the extension when the filename has one', () => {
			expect(getMediaExtension(makeFile('clip.mp4', 'video/mp4'))).toBe('.mp4');
		});

		it('returns a multi-char extension correctly', () => {
			expect(getMediaExtension(makeFile('track.flac', 'audio/flac'))).toBe('.flac');
		});

		it('prefers the filename extension over the MIME type', () => {
			// filename says .ogg but MIME says mp4 — filename wins
			expect(getMediaExtension(makeFile('audio.ogg', 'audio/mp4'))).toBe('.ogg');
		});
	});

	describe('MIME fallback', () => {
		it('falls back to MIME when filename has no extension', () => {
			expect(getMediaExtension(makeFile('recordedvideo', 'video/mp4'))).toBe('.mp4');
		});

		it('maps audio/mpeg to .mp3', () => {
			expect(getMediaExtension(makeFile('track', 'audio/mpeg'))).toBe('.mp3');
		});

		it('maps audio/mp4 to .m4a', () => {
			expect(getMediaExtension(makeFile('track', 'audio/mp4'))).toBe('.m4a');
		});

		it('maps video/quicktime to .mov', () => {
			expect(getMediaExtension(makeFile('screenrecording', 'video/quicktime'))).toBe('.mov');
		});
	});

	describe('edge cases', () => {
		it('returns .bin for unknown MIME with no extension', () => {
			expect(getMediaExtension(makeFile('blob', 'application/octet-stream'))).toBe('.bin');
		});

		it('handles dotfiles with no real extension', () => {
			// ".gitignore" — the match regex would return ".gitignore" as the extension;
			// that is technically correct behaviour (FFmpeg gets a hint), not a bug.
			expect(getMediaExtension(makeFile('.gitignore', 'text/plain'))).toBe('.gitignore');
		});
	});
});
