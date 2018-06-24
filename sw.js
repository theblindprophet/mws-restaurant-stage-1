let currentCache = 'mws-static-v7';

self.addEventListener('install', event => {
    let urlsToCache = [
        '/',
        '/manifest.json',
        '/restaurant.html',
        '/restaurant-form.html',
        '/js/all.min.js',
        '/js/main.min.js',
        '/js/restaurant-info.min.js',
        '/js/restaurant-form.min.js',
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
    // Because the cache matches by url, a restaurant.html/?id=# will not match
    // anything and therefore will fail when fetched offline. Therefore I check
    // to see if we are requesting that url and then request the base page and
    // add the query back after the cache has got the page
    let restaurantUrl = '';
    let url = event.request.url;
    if(url.match(/.*?8000\/restaurant\.html\?id\=[0-9]+/g)) {
        url = 'http://localhost:8000/restaurant.html';
        restaurantUrl = url;
    }
    event.respondWith(
        caches.match(url).then(response => {
            if(response) {
                if(restaurantUrl) response.url = restaurantUrl;
                return response;
            }
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
