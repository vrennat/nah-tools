// Extractive text summarizer. Scores sentences by the frequency of their
// content words and returns the highest-scoring ones in their original order.
// Fully offline. compromise is lazy-loaded only for robust sentence splitting.

import type { default as NlpType } from 'compromise';

let _nlp: typeof NlpType | null = null;
async function loadNlp(): Promise<typeof NlpType | null> {
	if (!_nlp) {
		try {
			const mod = await import('compromise');
			_nlp = mod.default;
		} catch {
			return null; // fall back to regex splitting
		}
	}
	return _nlp;
}

const STOP_WORDS = new Set([
	'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'of', 'at', 'by', 'for', 'with',
	'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
	'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
	'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
	'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'he', 'she', 'his',
	'her', 'we', 'our', 'you', 'your', 'i', 'me', 'my', 'as', 'so', 'than', 'too', 'very', 'can',
	'will', 'just', 'not', 'no', 'nor', 'only', 'own', 'same', 'such', 'each', 'few', 'more',
	'most', 'other', 'some', 'any', 'all', 'both', 'which', 'who', 'whom', 'what', 'when', 'where',
	'why', 'how', 'there', 'here', 'also', 'because', 'while', 'would', 'could', 'should', 'may',
	'might', 'must', 'shall', 'us', 'am', 'a', 'one'
]);

async function splitSentences(text: string): Promise<string[]> {
	const nlp = await loadNlp();
	if (nlp) {
		const out = nlp(text).sentences().out('array') as string[];
		const trimmed = out.map((s) => s.trim()).filter(Boolean);
		if (trimmed.length) return trimmed;
	}
	return text
		.replace(/\s+/g, ' ')
		.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)
		.map((s) => s.trim())
		.filter(Boolean);
}

function contentWords(sentence: string): string[] {
	return (sentence.toLowerCase().match(/[a-z0-9']+/g) ?? []).filter(
		(w) => w.length > 2 && !STOP_WORDS.has(w)
	);
}

export interface SummaryResult {
	summary: string;
	sentenceCount: number;
	summaryCount: number;
	reductionPct: number;
}

/**
 * @param ratio fraction of sentences to keep (0.05–1). Clamped; always keeps >=1.
 */
export async function summarize(text: string, ratio = 0.3): Promise<SummaryResult> {
	const clean = text.trim();
	if (!clean) return { summary: '', sentenceCount: 0, summaryCount: 0, reductionPct: 0 };

	const sentences = await splitSentences(clean);
	const total = sentences.length;
	if (total <= 1) {
		return { summary: clean, sentenceCount: total, summaryCount: total, reductionPct: 0 };
	}

	// Document-wide word frequencies.
	const freq = new Map<string, number>();
	const perSentenceWords = sentences.map((s) => contentWords(s));
	for (const words of perSentenceWords) {
		for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
	}
	const maxFreq = Math.max(1, ...freq.values());

	// Average normalized significance per sentence, with a mild lead bias.
	const scored = sentences.map((sentence, i) => {
		const words = perSentenceWords[i];
		const raw = words.reduce((sum, w) => sum + (freq.get(w) ?? 0) / maxFreq, 0);
		const score = (words.length ? raw / words.length : 0) * (i < 2 ? 1.1 : 1);
		return { i, score };
	});

	const keep = Math.max(1, Math.min(total, Math.round(total * Math.min(1, Math.max(0.05, ratio)))));
	const chosen = new Set(
		[...scored].sort((a, b) => b.score - a.score).slice(0, keep).map((s) => s.i)
	);

	const summary = sentences.filter((_, i) => chosen.has(i)).join(' ');
	return {
		summary,
		sentenceCount: total,
		summaryCount: chosen.size,
		reductionPct: Math.round(((total - chosen.size) / total) * 100)
	};
}
