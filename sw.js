self.addEventListener('install', event => {
    let urlsToCache = [
        '/',
        '/restaurant.html',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/js/dbhelper.js',
        '/css/styles.css',
        '/data/restaurants.json'
    ];

    event.waitUntil(
        caches.open('mws-static-v1').then(cache => {
            return cache.addAll(urlsToCache);
        }).catch(error => {
            console.log(error);
        })
    );
});

/**
 * Because we are only adding the largest images to the cache be default
 * we need to store the requested images into the cache if they are not the
 * largest. We can assume that if the user requested a certain size image
 * because on a certain size device then their device's size will most
 * likely not change, therefore they will request the same size image again.
 */
self.addEventListener('fetch', event => {
    // Requesting images
    event.respondWith(
        caches.match(event.request).then(response => {
            if(response) return response;
            // Add images to cache for next time
            if(event.request.url.endsWith('.jpg') || event.request.url.endsWith('.html')) {
                console.log(event.request.url);
                addToCache(event.request.url);
            }
            return fetch(event.request);
        })
    );
});

addToCache = (url) => {
    caches.open('mws-static-v1').then(cache => {
        cache.add(url);
    }).catch(error => {
        console.log(error);
    });
}
