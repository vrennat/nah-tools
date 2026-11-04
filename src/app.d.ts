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
			env: Env;
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
		}
	}
}

// Secrets are not in wrangler.jsonc, so `wrangler types` cannot see them. Declare them here.
// Optional because the app degrades when they are unset (analytics unavailable, no Turnstile).
declare global {
	namespace Cloudflare {
		interface Env {
			CF_ANALYTICS_TOKEN?: string;
			TURNSTILE_SECRET_KEY?: string;
		}
	}
}

export {};
