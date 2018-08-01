/*jshint unused:false*/
/*jshint strict:false*/
/*globals caches, Promise*/
var cacheName = 'v0.0.1';
var chartCacheLimit=10; //Cache Last Visited Charts
var filesToCache = [
	'/',
	'index.html',
	'css/style.css',
	'js/script.js',
	'images/icon.png',
	'images/chart.gif'
];

self.addEventListener('install', function(e) {
	console.log('[ServiceWorker] Install');
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			return cache.addAll(filesToCache);
		})
	);
});

self.addEventListener('activate', function(e) {
	console.log('[ServiceWorker] Activate');
	e.waitUntil(
		caches.keys().then(function(keyList) {
			return Promise.all(keyList.map(function(key) {
				if (key !== cacheName) {
					return caches.delete(key);
				}
			}));
		})
	);
	return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
	if(new URL(e.request.url).origin === location.origin){
		e.respondWith(
			caches.match(e.request).then(function(response) {
				return response || fetch(e.request);
			})
		);
	} else {
		var m="https://www.google.com/finance/chart?q=CURRENCY:";
		e.respondWith(
			caches.open(cacheName).then(function(cache) {
				return fetch(e.request).then(function(response){
					if(e.request.url.slice(0, m.length) === m){
						removeCart(cache, m);
					}
					cache.put(e.request, response.clone());
					return response;
				}).catch(function(err){
					if(e.request.url.slice(0, m.length) === m){
						return getCart(e);
					}
					else {
						return cache.match(e.request);
					}
				});
			})
		);
	}
});
function removeCart(cache, m){
	cache.keys().then(function(keyList) {
		var c=0;
		var k="";
		keyList.map(function(key) {
			if(key.url.slice(0, m.length) === m){
				c++;
				if(c==1)
					k=key;
			}
		});
		if(c>=chartCacheLimit)
			cache.delete(k);
	});
}
function getCart(e){
	return caches.match(e.request).then(function(response) {
		return response || caches.match("images/chart.gif");
	})
}