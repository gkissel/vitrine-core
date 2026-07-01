// Service worker with a combined offline experience:
// offline page fallback + offline copies of navigated pages/assets.

const CACHE_VERSION = "erva-mate-brasil-v2";
const APP_SHELL_CACHE = `${CACHE_VERSION}-app-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const OFFLINE_FALLBACK_PAGE = "/offline.html";
const APP_SHELL_URLS = [
	"/",
	OFFLINE_FALLBACK_PAGE,
	"/manifest.webmanifest",
	"/icons/icon-192.png",
	"/icons/icon-512.png",
	"/icons/maskable-192.png",
	"/icons/maskable-512.png",
];

self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});

self.addEventListener("install", (event) => {
	event.waitUntil(caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS)));
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		Promise.all([
			caches
				.keys()
				.then((keys) =>
					Promise.all(keys.filter((key) => key.startsWith(CACHE_VERSION) === false).map((key) => caches.delete(key))),
				),
			self.registration.navigationPreload ? self.registration.navigationPreload.enable() : Promise.resolve(),
		]),
	);
	self.clients.claim();
});

async function staleWhileRevalidate(request) {
	const cachedResponse = await caches.match(request);
	const networkResponsePromise = fetch(request).then((response) => {
		if (response && response.status === 200) {
			const responseClone = response.clone();
			caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
		}

		return response;
	});

	return cachedResponse || networkResponsePromise;
}

async function handleNavigation(event) {
	try {
		const preloadResponse = await event.preloadResponse;

		if (preloadResponse) {
			return preloadResponse;
		}

		const networkResponse = await fetch(event.request);

		if (networkResponse && networkResponse.status === 200) {
			const responseClone = networkResponse.clone();
			caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, responseClone));
		}

		return networkResponse;
	} catch {
		const cachedPage = await caches.match(event.request);

		if (cachedPage) {
			return cachedPage;
		}

		const cache = await caches.open(APP_SHELL_CACHE);
		return cache.match(OFFLINE_FALLBACK_PAGE);
	}
}

self.addEventListener("fetch", (event) => {
	const { request } = event;

	if (request.method !== "GET") {
		return;
	}

	const requestUrl = new URL(request.url);

	if (requestUrl.origin !== self.location.origin) {
		return;
	}

	if (request.mode === "navigate") {
		event.respondWith(handleNavigation(event));
		return;
	}

	if (["image", "font", "style", "script", "manifest"].includes(request.destination)) {
		event.respondWith(staleWhileRevalidate(request));
	}
});
