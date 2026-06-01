<script lang="ts">
	import DevToolShell from '$components/dev/DevToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';
	import { decodeJwt, claimStatuses, verifyJwt, type DecodedJwt, type VerifyResult } from '$lib/dev/jwt';

	const SAMPLE_TOKEN =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJBbGljZSIsImlhdCI6MTcxNjIzOTAyMiwiZXhwIjo0ODcwMTcwMjIyfQ.sampleSignatureForDemo';

	let token = $state('');
	let secretOrKey = $state('');
	let verifyResult = $state<VerifyResult | null>(null);
	let verifying = $state(false);

	type DecodeResult = { ok: true; jwt: DecodedJwt } | { ok: false; error: string };

	const decoded = $derived.by((): DecodeResult => {
		const t = token.trim();
		if (!t) return { ok: false, error: '' };
		try {
			return { ok: true, jwt: decodeJwt(t) };
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Invalid token' };
		}
	});

	const claims = $derived.by(() => {
		if (!decoded.ok) return [];
		return claimStatuses(decoded.jwt.payload);
	});

	function loadSample() {
		token = SAMPLE_TOKEN;
		verifyResult = null;
	}

	async function handleVerify() {
		const t = token.trim();
		const k = secretOrKey.trim();
		if (!t || !k) return;
		verifying = true;
		verifyResult = null;
		try {
			verifyResult = await verifyJwt(t, k);
		} finally {
			verifying = false;
		}
	}

	const faqs = [
		{
			question: 'Is my token sent to a server?',
			answer:
				'No. Decoding and verification both run entirely in your browser using the native Web Crypto API. Your token never leaves your machine.'
		},
		{
			question: 'Which algorithms does signature verification support?',
			answer:
				'HS256, HS384, HS512 (HMAC — use the shared secret string) and RS256, RS384, RS512 (RSA — paste the PEM public key starting with -----BEGIN PUBLIC KEY-----). Other algorithms report "unsupported."'
		},
		{
			question: 'Why does decoding work without a secret?',
			answer:
				'JWT header and payload are Base64URL-encoded, not encrypted. Anyone with the token can read the claims. Decoding is not the same as verification — you still need the secret or public key to confirm the signature is legitimate.'
		}
	];
</script>

<DevToolShell
	slug="jwt"
	title="JWT Decoder & Verifier"
	tagline="Decode JWT claims and verify signatures — entirely in your browser, nothing uploaded."
	description="Free JWT decoder and signature verifier. Inspect header, payload, and standard claims (exp, nbf, iat). Verify HS256/RS256 signatures with Web Crypto. 100% client-side."
	{faqs}
>
	<div class="space-y-6">
		<!-- Token input -->
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<label for="jwt-token" class="text-sm font-medium text-text">JWT token</label>
				<button type="button" onclick={loadSample} class="text-xs font-medium text-accent hover:underline">
					Load sample
				</button>
			</div>
			<textarea
				id="jwt-token"
				bind:value={token}
				spellcheck="false"
				placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
				class="h-28 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			></textarea>
			{#if !decoded.ok && decoded.error}
				<p class="text-sm text-error">{decoded.error}</p>
			{/if}
		</div>

		{#if decoded.ok && decoded.jwt}
			{@const jwt = decoded.jwt}

			<!-- Header + Payload panels -->
			<div class="grid gap-4 lg:grid-cols-2">
				<!-- Header -->
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-text">Header</span>
						<CopyButton text={() => JSON.stringify(jwt.header, null, 2)} small />
					</div>
					<pre class="overflow-auto rounded-lg border border-border bg-surface p-3 font-mono text-sm text-text">{JSON.stringify(jwt.header, null, 2)}</pre>
				</div>

				<!-- Payload -->
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-text">Payload</span>
						<CopyButton text={() => JSON.stringify(jwt.payload, null, 2)} small />
					</div>
					<pre class="overflow-auto rounded-lg border border-border bg-surface p-3 font-mono text-sm text-text">{JSON.stringify(jwt.payload, null, 2)}</pre>
				</div>
			</div>

			<!-- Signature -->
			<div class="space-y-1">
				<span class="text-sm font-medium text-text">Signature</span>
				<p class="break-all rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-muted">{jwt.signature}</p>
			</div>

			<!-- Claim statuses -->
			{#if claims.length > 0}
				<div class="space-y-2">
					<span class="text-sm font-medium text-text">Standard claims</span>
					<div class="divide-y divide-border rounded-lg border border-border bg-surface">
						{#each claims as claim}
							<div class="flex items-center justify-between px-3 py-2 text-sm">
								<span class="text-text-muted">{claim.label}</span>
								<span class={claim.expired === true ? 'text-error' : claim.expired === false ? 'text-success' : 'text-text'}>
									{claim.value}
									{#if claim.expired === true}
										{#if claim.label === 'Not before'}
											(not yet valid)
										{:else}
											(expired)
										{/if}
									{/if}
								</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Verification -->
			<div class="space-y-3 rounded-xl border border-border bg-surface-alt p-4">
				<h2 class="text-sm font-medium text-text">Verify signature</h2>
				<div class="space-y-1">
					<label for="jwt-secret" class="text-xs text-text-muted">
						Secret or PEM public key — HS256/384/512 use the shared secret; RS256/384/512 use a PEM public key (-----BEGIN PUBLIC KEY-----)
					</label>
					<textarea
						id="jwt-secret"
						bind:value={secretOrKey}
						spellcheck="false"
						placeholder="your-secret or -----BEGIN PUBLIC KEY-----&#10;..."
						class="h-24 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					></textarea>
				</div>
				<button
					type="button"
					onclick={handleVerify}
					disabled={verifying || !secretOrKey.trim()}
					class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
				>
					{verifying ? 'Verifying…' : 'Verify'}
				</button>

				{#if verifyResult}
					<div class="mt-2">
						{#if verifyResult.status === 'valid'}
							<p class="inline-flex items-center gap-1.5 text-sm font-medium text-success">
								<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								Signature valid
							</p>
						{:else if verifyResult.status === 'invalid'}
							<p class="inline-flex items-center gap-1.5 text-sm font-medium text-error">
								<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								Signature invalid
							</p>
						{:else if verifyResult.status === 'unsupported'}
							<p class="inline-flex items-center gap-1.5 text-sm font-medium text-warning">
								<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
								</svg>
								Unsupported algorithm: {verifyResult.alg}
							</p>
						{:else if verifyResult.status === 'error'}
							<p class="text-sm text-error">{verifyResult.message}</p>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</DevToolShell>
