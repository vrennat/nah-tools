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
				TURNSTILE_SECRET_KEY?: string;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
		}
	}
}

export {};
