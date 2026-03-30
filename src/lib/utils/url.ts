export function normalizeUrl(url: string): string {
	return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
