import { describe, expect, it } from 'vitest';
import { createWorkerClient } from './worker-client';

class FakeWorker extends EventTarget {
	terminated = false;
	postMessage() {}
	terminate() {
		this.terminated = true;
	}
	crash(message: string) {
		const event = new Event('error', { cancelable: true });
		Object.assign(event, { message });
		this.dispatchEvent(event);
	}
}

type Api = { work(): Promise<string> };

function setup() {
	const spawned: FakeWorker[] = [];
	const client = createWorkerClient<Api>(() => {
		const w = new FakeWorker();
		spawned.push(w);
		return w as unknown as Worker;
	});
	return { client, spawned };
}

describe('createWorkerClient', () => {
	it('reuses one worker across calls while it is healthy', () => {
		const { client, spawned } = setup();
		void client.call((api) => api.work());
		void client.call((api) => api.work());
		expect(spawned).toHaveLength(1);
	});

	it('rejects the pending call when the worker errors instead of hanging', async () => {
		const { client, spawned } = setup();
		const pending = client.call((api) => api.work());
		spawned[0].crash('boom');
		await expect(pending).rejects.toThrow('boom');
		expect(spawned[0].terminated).toBe(true);
	});

	it('spawns a fresh worker for the next call after a crash', async () => {
		const { client, spawned } = setup();
		const first = client.call((api) => api.work());
		spawned[0].crash('');
		await expect(first).rejects.toThrow(/stopped unexpectedly/);
		void client.call((api) => api.work());
		expect(spawned).toHaveLength(2);
	});
});
