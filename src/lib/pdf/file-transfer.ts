/**
 * Module-level file transfer for passing PDFs between routes without re-uploading.
 * Survives client-side navigation (SvelteKit doesn't reload the module).
 * Usage: individual tool pages call setPendingFile(), then navigate to /pdf/edit.
 * The editor checks consumePendingFile() on mount.
 */

let pendingFile: { bytes: Uint8Array; name: string } | null = null;

export function setPendingFile(bytes: Uint8Array, name: string) {
	pendingFile = { bytes, name };
}

export function consumePendingFile() {
	const file = pendingFile;
	pendingFile = null;
	return file;
}
