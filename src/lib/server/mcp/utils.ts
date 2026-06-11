/**
 * Shared utilities for MCP tool modules.
 */

// ~20 MB base64 string limit — base64 encodes 3 bytes as 4 chars,
// so 20_000_000 chars ≈ 15 MB of decoded binary data.
export const MAX_BASE64_BYTES = 20_000_000;

// Reasonable cap on merge arrays to prevent runaway memory usage.
export const MAX_MERGE_FILES = 10;

/**
 * O(n) base64 encoding via chunked String.fromCharCode.
 * The naive += per-byte approach is O(n²) due to string reallocation.
 */
export function bufferToB64(buf: Uint8Array): string {
	const CHUNK = 32768; // 32 KB chunks — safe for call stack
	let binary = '';
	for (let i = 0; i < buf.length; i += CHUNK) {
		binary += String.fromCharCode(...(buf.subarray(i, i + CHUNK) as unknown as number[]));
	}
	return btoa(binary);
}
