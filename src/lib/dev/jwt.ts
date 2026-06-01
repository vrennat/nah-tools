// JWT decoding and optional signature verification via Web Crypto (HS256/384/512
// and RS256/384/512). Everything runs locally; no token leaves the browser.

export interface DecodedJwt {
	header: Record<string, unknown>;
	payload: Record<string, unknown>;
	signature: string;
	raw: { header: string; payload: string; signature: string };
}

function base64UrlDecode(input: string): string {
	const b64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
	const bin = atob(b64);
	const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

export function decodeJwt(token: string): DecodedJwt {
	const parts = token.trim().split('.');
	if (parts.length !== 3) throw new Error('A JWT must have 3 dot-separated parts.');
	const [h, p, s] = parts;
	let header: Record<string, unknown>;
	let payload: Record<string, unknown>;
	try {
		header = JSON.parse(base64UrlDecode(h));
	} catch {
		throw new Error('Header is not valid Base64URL-encoded JSON.');
	}
	try {
		payload = JSON.parse(base64UrlDecode(p));
	} catch {
		throw new Error('Payload is not valid Base64URL-encoded JSON.');
	}
	return { header, payload, signature: s, raw: { header: h, payload: p, signature: s } };
}

// Human-readable expiry / not-before status from standard claims.
export interface ClaimStatus {
	label: string;
	value: string;
	expired?: boolean;
}

export function claimStatuses(payload: Record<string, unknown>, now = Date.now()): ClaimStatus[] {
	const out: ClaimStatus[] = [];
	const fmt = (sec: number) => new Date(sec * 1000).toLocaleString();
	if (typeof payload.iat === 'number') out.push({ label: 'Issued at', value: fmt(payload.iat) });
	if (typeof payload.nbf === 'number') {
		out.push({ label: 'Not before', value: fmt(payload.nbf), expired: payload.nbf * 1000 > now });
	}
	if (typeof payload.exp === 'number') {
		out.push({ label: 'Expires', value: fmt(payload.exp), expired: payload.exp * 1000 < now });
	}
	return out;
}

const HMAC_ALGS: Record<string, string> = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' };
const RSA_ALGS: Record<string, string> = { RS256: 'SHA-256', RS384: 'SHA-384', RS512: 'SHA-512' };

function b64UrlToBytes(input: string): Uint8Array {
	const b64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
	return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function pemToBytes(pem: string): Uint8Array {
	const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
	return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

// Web Crypto wants BufferSource backed by a plain ArrayBuffer; TS 5.7 types
// Uint8Array as ArrayBufferLike, so normalize to a guaranteed ArrayBuffer.
function toBuf(u: Uint8Array): ArrayBuffer {
	return u.byteOffset === 0 && u.byteLength === u.buffer.byteLength
		? (u.buffer as ArrayBuffer)
		: (u.slice().buffer as ArrayBuffer);
}

export type VerifyResult =
	| { status: 'valid' }
	| { status: 'invalid' }
	| { status: 'unsupported'; alg: string }
	| { status: 'error'; message: string };

export async function verifyJwt(token: string, secretOrKey: string): Promise<VerifyResult> {
	try {
		const parts = token.trim().split('.');
		if (parts.length !== 3) return { status: 'error', message: 'Malformed token.' };
		const { header } = decodeJwt(token);
		const alg = String(header.alg ?? '');
		const data = toBuf(new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
		const sig = toBuf(b64UrlToBytes(parts[2]));

		if (alg in HMAC_ALGS) {
			const key = await crypto.subtle.importKey(
				'raw',
				toBuf(new TextEncoder().encode(secretOrKey)),
				{ name: 'HMAC', hash: HMAC_ALGS[alg] },
				false,
				['verify']
			);
			const ok = await crypto.subtle.verify('HMAC', key, sig, data);
			return { status: ok ? 'valid' : 'invalid' };
		}

		if (alg in RSA_ALGS) {
			const key = await crypto.subtle.importKey(
				'spki',
				toBuf(pemToBytes(secretOrKey)),
				{ name: 'RSASSA-PKCS1-v1_5', hash: RSA_ALGS[alg] },
				false,
				['verify']
			);
			const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sig, data);
			return { status: ok ? 'valid' : 'invalid' };
		}

		return { status: 'unsupported', alg: alg || 'unknown' };
	} catch (e) {
		return { status: 'error', message: e instanceof Error ? e.message : 'Verification failed.' };
	}
}
