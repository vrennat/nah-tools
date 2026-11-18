import * as Comlink from 'comlink';

const WORKER_STOPPED = 'The background worker stopped unexpectedly. Please try again.';

// Comlink never settles a call if its worker dies (script fails to load, OOM,
// uncaught error), so a cached worker would leave every later call hanging.
// Each call listens for the worker's error event until it settles; on error the
// cached worker is dropped and the next call spawns a fresh one. The listener is
// removed when the call settles, so finished calls and their results are not
// kept alive by a healthy worker.
export function createWorkerClient<T>(spawn: () => Worker) {
	let worker: Worker | null = null;
	let api: Comlink.Remote<T> | null = null;

	function terminate() {
		worker?.terminate();
		worker = null;
		api = null;
	}

	function connect(): { worker: Worker; api: Comlink.Remote<T> } {
		if (worker && api) return { worker, api };
		const w = spawn();
		w.addEventListener('error', (event) => {
			event.preventDefault();
			if (worker === w) terminate();
		});
		worker = w;
		api = Comlink.wrap<T>(w);
		return { worker: w, api };
	}

	function call<R>(fn: (api: Comlink.Remote<T>) => Promise<R>): Promise<R> {
		const { worker: w, api } = connect();
		return new Promise<R>((resolve, reject) => {
			const onError = (event: Event) => {
				reject(new Error((event as ErrorEvent).message || WORKER_STOPPED));
			};
			w.addEventListener('error', onError);
			const done = () => w.removeEventListener('error', onError);
			Promise.resolve()
				.then(() => fn(api))
				.then(
					(value) => {
						done();
						resolve(value);
					},
					(error) => {
						done();
						reject(error);
					}
				);
		});
	}

	return { call, terminate };
}
