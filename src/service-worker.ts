/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

const CACHE_NAME = `nah-tools-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	// Skip non-GET and cross-origin
	if (event.request.method !== 'GET') return;
	if (url.origin !== self.location.origin) return;

	// Skip API routes
	if (url.pathname.startsWith('/api/')) return;

	if (ASSETS.includes(url.pathname)) {
		// Cache-first for versioned build assets
		event.respondWith(
			caches.match(event.request).then((cached) => cached || fetch(event.request))
		);
	} else {
		// Network-first for pages, fallback to cache
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					if (response.ok) {
						const clone = response.clone();
						caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
					}
					return response;
				})
				.catch(() => caches.match(event.request).then((cached) => cached || new Response('Offline', { status: 503 })))
		);
	}
});
