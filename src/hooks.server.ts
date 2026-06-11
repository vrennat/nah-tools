import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Enable cross-origin isolation for SharedArrayBuffer (needed by ONNX Runtime WASM threads).
	// credentialless allows cross-origin resources (fonts, analytics) without CORP headers.
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
	response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');

	// Prevent MIME sniffing attacks
	response.headers.set('X-Content-Type-Options', 'nosniff');
	// Prevent the app from being embedded in iframes (clickjacking protection)
	response.headers.set('X-Frame-Options', 'DENY');
	// Limit referrer information sent to third parties
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	return response;
};
