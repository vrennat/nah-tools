/**
 * Module-level file transfer for passing files between routes without re-uploading.
 * Survives client-side navigation (SvelteKit doesn't reload the module on soft nav).
 *
 * Why a module singleton instead of a store or URL state:
 *   - Uint8Array can be large (tens of MB); we never want it serialised into a URL
 *     or duplicated into a reactive store that might be read by multiple subscribers.
 *   - consumePendingFile() clears the reference immediately so the bytes are eligible
 *     for GC as soon as the receiving page is mounted and has taken ownership.
 *
 * Usage pattern:
 *   Sender:  setPendingFile(resultBytes, filename, 'Merge PDF')
 *            goto('/pdf/compress')
 *   Receiver (FileDropZone with acceptPendingFile): consumePendingFile() on mount
 */

interface PendingFile {
	bytes: Uint8Array;
	name: string;
	/** Human-readable label of the tool that produced this file, e.g. 'Merge PDF'. */
	sourceLabel?: string;
}

let pendingFile: PendingFile | null = null;

export function setPendingFile(bytes: Uint8Array, name: string, sourceLabel?: string) {
	pendingFile = { bytes, name, sourceLabel };
}

export function consumePendingFile(): PendingFile | null {
	const file = pendingFile;
	// Clear immediately so bytes become eligible for GC once the consumer is done.
	pendingFile = null;
	return file;
}
