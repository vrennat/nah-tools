import { error } from '@sveltejs/kit';

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
 *
 * The client widget ($components/Turnstile.svelte) only renders when
 * PUBLIC_TURNSTILE_SITE_KEY was set at build time. When TURNSTILE_SECRET_KEY
 * is missing this skips verification and warns, so creates keep working
 * before the keys are configured. With the secret set, a missing token is 400
 * and a rejected token is 403 — so deploy the site key before the secret.
 */
export async function requireTurnstile(
	platform: App.Platform | undefined,
	request: Request,
	token: string | undefined
): Promise<void> {
	const secret = platform?.env?.TURNSTILE_SECRET_KEY;
	if (!secret) {
		// No project logger exists for server code; console.warn is the convention here.
		console.warn('TURNSTILE_SECRET_KEY not configured - Turnstile bot protection is disabled');
		return;
	}
	if (!token) {
		throw error(400, 'Turnstile verification is required');
	}
	const ip = request.headers.get('cf-connecting-ip') || undefined;
	if (!(await verifyTurnstile(token, secret, ip))) {
		throw error(403, 'Turnstile verification failed');
	}
}
