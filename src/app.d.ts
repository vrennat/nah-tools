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
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
		}
	}
}

export {};
