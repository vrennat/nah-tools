/**
 * Compute match score as percentage of job keywords found in resume keywords.
 * Returns a number between 0 and 100, rounded to nearest integer.
 */
export function computeMatchScore(resumeKeywords: string[], jobKeywords: string[]): number {
	if (jobKeywords.length === 0) return 100;
	if (resumeKeywords.length === 0) return 0;

	const matched = findMatchedKeywords(resumeKeywords, jobKeywords);
	return Math.round((matched.length / jobKeywords.length) * 100);
}

/**
 * Find job keywords that are NOT present in the resume keywords.
 */
export function findMissingKeywords(resumeKeywords: string[], jobKeywords: string[]): string[] {
	const resumeSet = new Set(resumeKeywords.map((k) => k.toLowerCase()));
	return jobKeywords.filter((jk) => !keywordMatch(jk.toLowerCase(), resumeSet));
}

/**
 * Find job keywords that ARE present in the resume keywords (the overlap).
 */
export function findMatchedKeywords(resumeKeywords: string[], jobKeywords: string[]): string[] {
	const resumeSet = new Set(resumeKeywords.map((k) => k.toLowerCase()));
	return jobKeywords.filter((jk) => keywordMatch(jk.toLowerCase(), resumeSet));
}

/**
 * Check if a keyword matches any entry in the set.
 * Uses exact match first, then word-boundary-aware substring for multi-word terms.
 */
function keywordMatch(keyword: string, set: Set<string>): boolean {
	if (set.has(keyword)) return true;
	// Only do substring matching for terms with 4+ chars to avoid false positives
	if (keyword.length < 4) return false;
	for (const entry of set) {
		if (entry.length < 4) continue;
		// Check if one is a multi-word version of the other (e.g. "react" in "react native")
		if (entry.includes(keyword) || keyword.includes(entry)) {
			// Require that the match is on a word boundary
			const longer = entry.length > keyword.length ? entry : keyword;
			const shorter = entry.length > keyword.length ? keyword : entry;
			const idx = longer.indexOf(shorter);
			const before = idx === 0 || /[\s/.-]/.test(longer[idx - 1]);
			const after = idx + shorter.length === longer.length || /[\s/.-]/.test(longer[idx + shorter.length]);
			if (before && after) return true;
		}
	}
	return false;
}
