let restaurants, neighborhoods, cuisines
var map
var markers = []

/**
* Fetch neighborhoods and cuisines as soon as the page is loaded.
*/
document.addEventListener('DOMContentLoaded', (event) => {
    DBHelper.openDatabase();
    updateRestaurants();
    fetchNeighborhoods();
    fetchCuisines();
    listenTabClick();
    listenFocusSelect();
    listenImageLoads();
});

/**
 * Listen for the click of the list or map button
 * Loading a map on the first load is extremely taxing on performace
 */
listenTabClick = () => {
    document.querySelector('#list-button').addEventListener('click', (e) => {
        if(!e.srcElement.classList.contains('active')) {
            document.querySelector('#list-button').classList.add('active');
            document.querySelector('#map-button').classList.remove('active');
            document.querySelector('#mainsection').classList.add('active');
            document.querySelector('#map-container').classList.remove('active');
        }
    });
    document.querySelector('#map-button').addEventListener('click', (e) => {
        if(!e.srcElement.classList.contains('active')) {
            document.querySelector('#list-button').classList.remove('active');
            document.querySelector('#map-button').classList.add('active');
            document.querySelector('#mainsection').classList.remove('active');
            document.querySelector('#map-container').classList.add('active');
        }
    });
}

/**
* Lazy loading of images
* https://www.sitepoint.com/five-techniques-lazy-load-images-website-performance/
*/
listenImageLoads = () => {
    [].forEach.call(document.querySelectorAll('img[data-src]'), function(img) {
        img.setAttribute('src', img.getAttribute('data-src'));
        img.onload = function() {
            img.removeAttribute('data-src');
        };
    });
}

/**
* Fetch all neighborhoods and set their HTML.
*/
fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods().then(neighborhoods => {
        self.neighborhoods = neighborhoods;
        fillNeighborhoodsHTML();
    }).catch(error => {
        console.error(error);
    });
}

/**
* Set neighborhoods HTML.
*/
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
}

/**
* Fetch all cuisines and set their HTML.
*/
fetchCuisines = () => {
    DBHelper.fetchCuisines().then(cuisines => {
        self.cuisines = cuisines;
        fillCuisinesHTML();
    }).catch(error => {
        console.error(error);
    });
}

/**
* Set cuisines HTML.
*/
fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
}

/**
* Initialize Google map, called from HTML.
*/
window.initMap = () => {
    let loc = {
        lat: 40.722216,
        lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: loc,
        scrollwheel: false
    });
    // Remove tabindex from map
    google.maps.event.addListener(self.map, "tilesloaded", function() {
        setTimeout(() => {
            [].slice.apply(document.querySelectorAll('#map a')).forEach(function(item) {
                item.setAttribute('tabIndex','-1');
            });
        }, 600);
    });
}

/**
* Update page and map for current restaurants.
*/
updateRestaurants = () => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value || 'all';
    const neighborhood = nSelect[nIndex].value || 'all';

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood).then(restaurants => {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
    }).catch(error => {
        console.error(error);
    });
}

/**
* Clear current restaurants, their HTML and remove their map markers.
*/
resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    self.markers.forEach(m => m.setMap(null));
    self.markers = [];
    self.restaurants = restaurants;
}

/**
* Create all restaurants HTML and add them to the webpage.
*/
fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
}

/**
* Create restaurant HTML.
*/
createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');

    const picture = document.createElement('picture');
    const source1 = document.createElement('source');
    const source2 = document.createElement('source');
    const image = document.createElement('img');

    if(!restaurant.photograph) {
        restaurant.photograph = "restaurant_placeholder";
    }
    source1.setAttribute('media', '(max-width: 400px)');
    let photograph_s = restaurant.photograph + '-400-s.jpg';
    source1.setAttribute('data-srcset', `/img/${photograph_s}`);
    source2.setAttribute('media', '(max-width: 600px)');
    let photograph_m = restaurant.photograph + '-600-m.jpg';
    source2.setAttribute('data-srcset', `/img/${photograph_m}`);
    image.className = 'restaurant-img lazyload';
    image.setAttribute('alt', restaurant.name || 'restaurant');
    image.setAttribute('data-src', DBHelper.imageUrlForRestaurant(restaurant));

    picture.append(source1);
    picture.append(source2);
    picture.append(image);

    li.append(picture);

    const name = document.createElement('h1');
    name.innerHTML = restaurant.name;
    li.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    li.append(more);

    return li;
}

/**
* Add markers for current restaurants to the map.
*/
addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
        google.maps.event.addListener(marker, 'click', () => {
            window.location.href = marker.url
        });
        self.markers.push(marker);
    });
}

listenFocusSelect = () => {
    document.querySelectorAll('.filter-options select').forEach(el => {
        el.addEventListener('focus', e => {
            e.srcElement.parentElement.classList.add('focused');
        });
    });
    document.querySelectorAll('.filter-options select').forEach(el => {
        el.addEventListener('focusout', e => {
            e.srcElement.parentElement.classList.remove('focused');
        });
    });
}

/**
* Register the service worker inside sw.js
*/
registerServiceWorker = () => {
    if(!navigator.serviceWorker) return;
    navigator.serviceWorker.register('/sw.js').then(() => {
        console.log('Registration worked!');
    }).catch(error => {
        console.log('Registration failed!', error);
    });
}
registerServiceWorker();
