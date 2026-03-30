import nlp from 'compromise';

const STOP_WORDS = new Set([
	'a',
	'an',
	'the',
	'and',
	'or',
	'but',
	'is',
	'are',
	'was',
	'were',
	'be',
	'been',
	'being',
	'have',
	'has',
	'had',
	'do',
	'does',
	'did',
	'will',
	'would',
	'could',
	'should',
	'may',
	'might',
	'shall',
	'can',
	'to',
	'of',
	'in',
	'for',
	'on',
	'with',
	'at',
	'by',
	'from',
	'as',
	'into',
	'about',
	'between',
	'through',
	'after',
	'before',
	'above',
	'below',
	'up',
	'down',
	'out',
	'off',
	'over',
	'under',
	'this',
	'that',
	'these',
	'those',
	'it',
	'its',
	'i',
	'we',
	'you',
	'he',
	'she',
	'they',
	'me',
	'us',
	'him',
	'her',
	'them',
	'my',
	'our',
	'your',
	'his',
	'their',
	'not',
	'no',
	'nor',
	'so',
	'if',
	'then',
	'than',
	'too',
	'very',
	'just',
	'also',
	'more',
	'most',
	'such',
	'only',
	'own',
	'same',
	'all',
	'each',
	'every',
	'both',
	'few',
	'some',
	'any',
	'other',
	'new',
	'old',
	'who',
	'what',
	'which',
	'when',
	'where',
	'how',
	'why',
	'here',
	'there'
]);

/**
 * Extract meaningful keywords from text using NLP and pattern matching.
 */
export function extractKeywords(text: string): string[] {
	if (!text.trim()) return [];

	const keywords = new Set<string>();

	// Use compromise for nouns and proper nouns
	const doc = nlp(text);
	for (const noun of doc.nouns().out('array') as string[]) {
		const cleaned = noun.toLowerCase().replace(/[^a-z0-9\s./-]/g, '').trim();
		if (cleaned && !STOP_WORDS.has(cleaned) && cleaned.length > 1) {
			keywords.add(cleaned);
		}
	}

	// Extract technical patterns from the raw text
	const words = text.split(/[\s,;()|]+/);
	for (const word of words) {
		const trimmed = word.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9+#/.]+$/g, '');
		if (!trimmed || trimmed.length < 2) continue;

		// Acronyms: AWS, GCP, CI/CD
		if (/^[A-Z][A-Z0-9/]{1,}$/.test(trimmed)) {
			keywords.add(trimmed.toLowerCase());
		}

		// CamelCase / PascalCase: JavaScript, TypeScript, Node.js, PostgreSQL
		if (/^[A-Z][a-z]+[A-Z]/.test(trimmed) || /^[A-Z][a-z]+\.[a-z]+$/i.test(trimmed)) {
			keywords.add(trimmed.toLowerCase());
		}

		// Tech terms with dots or plus signs: Node.js, C++, C#
		if (/^[a-zA-Z]+[.#+][a-zA-Z0-9]*$/.test(trimmed)) {
			keywords.add(trimmed.toLowerCase());
		}

		// Hyphenated terms that look technical
		if (/^[a-zA-Z]+-[a-zA-Z]+/.test(trimmed) && trimmed.length > 3) {
			keywords.add(trimmed.toLowerCase());
		}

		// Known-shape tech words (anything capitalized that isn't a sentence start)
		const lower = trimmed.toLowerCase();
		if (!STOP_WORDS.has(lower) && /^[A-Z][a-z]{2,}/.test(trimmed)) {
			// Only add if it appears to be a proper noun / tech term in context
			const idx = text.indexOf(trimmed);
			if (idx > 0 && text[idx - 1] !== '.') {
				keywords.add(lower);
			}
		}
	}

	// Also extract significant standalone lowercase words (nouns compromise might miss)
	for (const word of words) {
		const cleaned = word.replace(/[^a-zA-Z0-9./#+-]/g, '').toLowerCase();
		if (
			cleaned.length > 2 &&
			!STOP_WORDS.has(cleaned) &&
			/[a-z]/.test(cleaned)
		) {
			// Only include if it looks like a meaningful term (not a common verb/adjective)
			const commonVerbs = new Set([
				'looking',
				'experience',
				'required',
				'ability',
				'strong',
				'ideal',
				'candidate',
				'plus',
				'using',
				'work',
				'working',
				'build',
				'building',
				'develop',
				'developing',
				'create',
				'creating',
				'manage',
				'managing',
				'lead',
				'leading'
			]);
			if (!commonVerbs.has(cleaned)) {
				keywords.add(cleaned);
			}
		}
	}

	return Array.from(keywords);
}
