// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: import('@cloudflare/workers-types').D1Database;
				KV: KVNamespace;
				CF_ACCOUNT_ID?: string;
				CF_ANALYTICS_TOKEN?: string;
				TURNSTILE_SECRET_KEY?: string;
				CREATE_LIMITER?: RateLimit;
				/** Workers AI, used by the link spam gate. Missing means links are allowed unchecked and logged. */
				AI?: Ai;
				/** Daily cap on spam-gate model calls; defaults to 5000 (src/lib/server/link-gate/budget.ts). */
				LINK_GATE_DAILY_MODEL_CALLS?: string;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
		}
	}
}

export {};
