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
	return jobKeywords.filter((jk) => {
		const lower = jk.toLowerCase();
		// Check exact match or substring match
		for (const rk of resumeSet) {
			if (rk === lower || rk.includes(lower) || lower.includes(rk)) {
				return false;
			}
		}
		return true;
	});
}

/**
 * Find job keywords that ARE present in the resume keywords (the overlap).
 */
export function findMatchedKeywords(resumeKeywords: string[], jobKeywords: string[]): string[] {
	const resumeSet = new Set(resumeKeywords.map((k) => k.toLowerCase()));
	return jobKeywords.filter((jk) => {
		const lower = jk.toLowerCase();
		for (const rk of resumeSet) {
			if (rk === lower || rk.includes(lower) || lower.includes(rk)) {
				return true;
			}
		}
		return false;
	});
}
