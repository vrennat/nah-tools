import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';

/** Verify a Cloudflare Turnstile token */
export async function verifyTurnstile(
	token: string,
	secretKey: string,
	ip?: string
): Promise<boolean> {
	const body: Record<string, string> = {
		secret: secretKey,
		response: token
	};
	if (ip) body.remoteip = ip;

	const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	const data = (await res.json()) as { success: boolean };
	return data.success;
}

/**
 * Enforce Turnstile on a create endpoint.
 * Fails closed: without TURNSTILE_SECRET_KEY outside dev, the request is refused
 * with 503 rather than silently skipping bot protection. In dev it is skipped.
 */
export async function requireTurnstile(
	platform: App.Platform | undefined,
	request: Request,
	token: string | undefined
): Promise<void> {
	const secret = platform?.env?.TURNSTILE_SECRET_KEY;
	if (!secret) {
		if (dev) return;
		console.error('TURNSTILE_SECRET_KEY not configured - refusing request');
		throw error(503, 'Bot protection is not configured on this server');
	}
	if (!token) {
		throw error(400, 'Turnstile verification is required');
	}
	const ip = request.headers.get('cf-connecting-ip') || undefined;
	if (!(await verifyTurnstile(token, secret, ip))) {
		throw error(403, 'Turnstile verification failed');
	}
}
