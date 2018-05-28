let currentCache = 'mws-static-v4';

self.addEventListener('install', event => {
    let urlsToCache = [
        '/',
        '/restaurant.html',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/js/dbhelper.js',
        '/js/idb.js',
        '/css/styles.css'
    ];

    event.waitUntil(
        caches.open(currentCache).then(cache => {
            return cache.addAll(urlsToCache);
        }).catch(error => {
            console.log(error);
        })
    );
});

/**
 * Remove old caches here
 */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(a => {
                    return a.startsWith('mws-static') && a != currentCache;
                }).map(a => {
                    return caches.delete(a);
                })
            )
        })
    );
});

/**
 * Because we are only adding the largest images to the cache be default
 * we need to store the requested images into the cache if they are not the
 * largest. We can assume that if the user requested a certain size image
 * because on a certain size device then their device's size will most
 * likely not change, therefore they will request the same size image again.
 * It does, however, take 2 loads of the page before the user will store images
 */
self.addEventListener('fetch', event => {
    // Requesting images
    event.respondWith(
        caches.match(event.request).then(response => {
            if(response) return response;
            // Add images to cache for next time
            if(event.request.url.endsWith('.jpg') || event.request.url.endsWith('.html')) {
                addToCache(event.request.url);
            }
            return fetch(event.request);
        })
    );
});

addToCache = (url) => {
    caches.open(currentCache).then(cache => {
        cache.add(url);
    }).catch(error => {
        console.log(error);
    });
}
