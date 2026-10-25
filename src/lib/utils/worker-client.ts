import * as Comlink from 'comlink';

// Comlink never settles a call if its worker dies (script fails to load, OOM,
// uncaught error), so a cached worker would leave every later call hanging.
// Each call races the worker's error event; on error the cached worker is
// dropped and the next call spawns a fresh one.
export function createWorkerClient<T>(spawn: () => Worker) {
	let worker: Worker | null = null;
	let api: Comlink.Remote<T> | null = null;
	let failed: Promise<never> = Promise.resolve() as never;

	function terminate() {
		worker?.terminate();
		worker = null;
		api = null;
	}

	function connect() {
		if (worker && api) return { api, failed };
		const w = spawn();
		failed = new Promise<never>((_, reject) => {
			w.addEventListener('error', (event) => {
				event.preventDefault();
				if (worker === w) terminate();
				const message = (event as ErrorEvent).message;
				reject(new Error(message || 'The background worker stopped unexpectedly. Please try again.'));
			});
		});
		failed.catch(() => {});
		worker = w;
		api = Comlink.wrap<T>(w);
		return { api, failed };
	}

	function call<R>(fn: (api: Comlink.Remote<T>) => Promise<R>): Promise<R> {
		const { api, failed } = connect();
		return Promise.race([fn(api), failed]);
	}

	return { call, terminate };
}
