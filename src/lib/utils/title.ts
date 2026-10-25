export const SITE_SUFFIX = '| nah.tools';

/**
 * Normalise a page title to the single site-wide pattern "<title> | nah.tools".
 * Strips any existing "| nah", "— nah", "- nah.tools" style suffix first so
 * titles authored with older patterns end up identical.
 */
export function withSiteSuffix(title: string): string {
	const base = title.replace(/\s*[|—–-]\s*nah(\.tools)?\s*$/i, '').trim();
	return `${base} ${SITE_SUFFIX}`;
}
