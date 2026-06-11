import type { ToolEntry } from '$lib/registry/types';
import { allTools } from '$lib/registry/index';

// Scoring tiers — higher is better. A tool's final score is the max across all
// tiers that apply; we don't sum them so that a keyword hit never beats a name
// prefix hit regardless of how many keywords match.
const SCORE = {
	NAME_PREFIX: 100,
	NAME_WORD_BOUNDARY: 80,
	KEYWORD_EXACT: 60,
	KEYWORD_PREFIX: 50,
	NAME_SUBSTRING: 30,
	DESCRIPTION_SUBSTRING: 10
} as const;

function tokenize(s: string): string[] {
	// Split on non-word characters to get word tokens for boundary matching.
	return s.toLowerCase().split(/\W+/).filter(Boolean);
}

function scoreEntry(entry: ToolEntry, q: string): number {
	const nameLower = entry.name.toLowerCase();
	const descLower = entry.description.toLowerCase();
	const keywords = (entry.keywords ?? []).map((k) => k.toLowerCase());

	let best = 0;

	// Exact name prefix match (e.g. query "merge" matches "Merge PDFs")
	if (nameLower.startsWith(q)) best = Math.max(best, SCORE.NAME_PREFIX);

	// Word-boundary name match: any word in the name starts with the query
	if (tokenize(entry.name).some((w) => w.startsWith(q))) {
		best = Math.max(best, SCORE.NAME_WORD_BOUNDARY);
	}

	// Keyword matching: exact keyword equals query, or keyword starts with query
	for (const kw of keywords) {
		if (kw === q) {
			best = Math.max(best, SCORE.KEYWORD_EXACT);
		} else if (kw.startsWith(q)) {
			best = Math.max(best, SCORE.KEYWORD_PREFIX);
		}
	}

	// Substring fallbacks for when the query appears anywhere in name or desc
	if (nameLower.includes(q)) best = Math.max(best, SCORE.NAME_SUBSTRING);
	if (descLower.includes(q)) best = Math.max(best, SCORE.DESCRIPTION_SUBSTRING);

	return best;
}

/**
 * Search tools by name, keywords, and description.
 * Returns an empty array for blank/whitespace queries.
 * Scoring priority: exact name prefix > word-boundary name > keyword exact >
 * keyword prefix > name substring > description substring.
 * Ties broken by family then name (alphabetical) for stable ordering.
 */
export function searchTools(query: string, limit = 50): ToolEntry[] {
	const q = query.trim().toLowerCase();
	if (!q) return [];

	const scored: Array<{ entry: ToolEntry; score: number }> = [];

	for (const entry of allTools) {
		const score = scoreEntry(entry, q);
		if (score > 0) scored.push({ entry, score });
	}

	scored.sort((a, b) => {
		if (b.score !== a.score) return b.score - a.score;
		// Tiebreak: family then name, both ascending
		const familyDiff = a.entry.family.localeCompare(b.entry.family);
		if (familyDiff !== 0) return familyDiff;
		return a.entry.name.localeCompare(b.entry.name);
	});

	return scored.slice(0, limit).map((s) => s.entry);
}

/**
 * Returns tools marked popular: true, in registry definition order.
 * Used for quick-access chips below the search input.
 */
export function popularTools(): ToolEntry[] {
	return allTools.filter((t) => t.popular === true);
}
