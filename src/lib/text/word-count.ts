// Plain-text statistics. All synchronous, no dependencies.

export interface TextStats {
	words: number;
	characters: number;
	charactersNoSpaces: number;
	sentences: number;
	paragraphs: number;
	lines: number;
	readingTime: number; // seconds, ~225 wpm
	speakingTime: number; // seconds, ~130 wpm
}

const READING_WPM = 225;
const SPEAKING_WPM = 130;

export function analyzeText(text: string): TextStats {
	const trimmed = text.trim();

	const words = trimmed === '' ? 0 : trimmed.split(/\s+/).filter(Boolean).length;
	const characters = text.length;
	const charactersNoSpaces = text.replace(/\s/g, '').length;

	// Sentences: runs ending in . ! ? (collapsing repeats like "?!").
	const sentenceMatches = trimmed === '' ? [] : trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
	const sentences = sentenceMatches ? sentenceMatches.length : 0;

	// Paragraphs: blocks separated by one or more blank lines.
	const paragraphs = trimmed === '' ? 0 : trimmed.split(/\n\s*\n/).filter((p) => p.trim() !== '').length;

	const lines = text === '' ? 0 : text.split(/\n/).length;

	return {
		words,
		characters,
		charactersNoSpaces,
		sentences,
		paragraphs,
		lines,
		readingTime: Math.round((words / READING_WPM) * 60),
		speakingTime: Math.round((words / SPEAKING_WPM) * 60)
	};
}

export function formatDuration(seconds: number): string {
	if (seconds <= 0) return '0 sec';
	if (seconds < 60) return `${seconds} sec`;
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return secs === 0 ? `${mins} min` : `${mins} min ${secs} sec`;
}
