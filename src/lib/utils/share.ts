/**
 * Web Share API Wrapper
 * Shares QR code image directly to native apps on mobile
 */

export function canShare(): boolean {
	return typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare;
}

export async function shareQR(blob: Blob, filename: string): Promise<boolean> {
	if (!canShare()) return false;

	const file = new File([blob], filename, { type: blob.type });
	const shareData = { files: [file] };

	if (!navigator.canShare(shareData)) return false;

	try {
		await navigator.share(shareData);
		return true;
	} catch (err) {
		// User cancelled — not an error
		if (err instanceof Error && err.name === 'AbortError') return false;
		throw err;
	}
}
