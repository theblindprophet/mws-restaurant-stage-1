self.addEventListener('install', event => {
    let urlsToCache = [
        '/',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/js/dbhelper.js',
        '/css/styles.css',
        '/data/restaurants.json'
    ];
    // Add images to array
    urlsToCache = urlsToCache.concat(getImageUrls());

    event.waitUntil(
        caches.open('mws-static-v1').then((cache) => {
            return cache.addAll(urlsToCache);
        }).catch(error => {
            console.log(error);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            console.log(response);
            if(response) return response;

            return fetch(event.request);
        })
    );
});

getImageUrls = () => {
    let urls = [];
    for(let i=1; i<=10; i++) {
        for(let j=2; j<=4; j++) {
            let url = '/img/' + i + '-' + (j * 200);
            switch(j) {
                case 2:
                    url += '-s.jpg';
                    break;
                case 3:
                    url += '-m.jpg';
                    break;
                case 4:
                    url += '-l.jpg';
                    break;
                default:
                    break;
            }
            urls.push(url);
        }
    }
    return urls;
}
