/**
* Common database helper functions.
*/
class DBHelper {

    /**
    * Database URL, local API on port 1337
    */
    static get DATABASE_URL() {
        const port = 1337 // Change this to your server port
        return `http://localhost:${port}/restaurants`;
    }

    /**
    * Fetch all restaurants.
    */
    static fetchRestaurants() {
        return new Promise((resolve, reject) => {
            fetch(DBHelper.DATABASE_URL).then(response => {
                response.json().then(data => {
                    return resolve(data);
                });
            }).catch(error => {
                return reject(error);
            });
        });
    }

    /**
    * Fetch a restaurant by its ID.
    */
    static fetchRestaurantById(id) {
        return new Promise((resolve, reject) => {
            // fetch all restaurants with proper error handling.
            DBHelper.fetchRestaurants().then(restaurants => {
                const restaurant = restaurants.find(r => r.id == id);
                if(restaurant) { // Got the restaurant
                    return resolve(restaurant);
                } else { // Restaurant does not exist in the database
                    return reject('Restaurant does not exist');
                }
            }).catch(error => {
                return reject(error);
            });
        });
    }

    /**
    * Fetch restaurants by a cuisine type with proper error handling.
    */
    static fetchRestaurantByCuisine(cuisine) {
        return new Promise((resolve, reject) => {
            // Fetch all restaurants  with proper error handling
            DBHelper.fetchRestaurants().then(restaurants => {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                return resolve(results);
            }).catch(error => {
                return reject(error);
            });
        });
    }

    /**
    * Fetch restaurants by a neighborhood with proper error handling.
    */
    static fetchRestaurantByNeighborhood(neighborhood) {
        return new Promise((resolve, reject) => {
            // Fetch all restaurants
            DBHelper.fetchRestaurants().then(restaurants => {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                return resolve(results);
            }).catch(error => {
                return reject(error);
            });
        });
    }

    /**
    * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
    */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
        return new Promise((resolve, reject) => {
            // Fetch all restaurants
            DBHelper.fetchRestaurants().then(restaurants => {
                let results = restaurants;
                if(cuisine != 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if(neighborhood != 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                return resolve(results);
            }).catch(error => {
                return reject(error);
            });
        });
    }

    /**
    * Fetch all neighborhoods with proper error handling.
    */
    static fetchNeighborhoods() {
        return new Promise((resolve, reject) => {
            // Fetch all restaurants
            DBHelper.fetchRestaurants().then(restaurants => {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
                return resolve(uniqueNeighborhoods);
            }).catch(error => {
                return reject(error);
            });
        });
    }

    /**
    * Fetch all cuisines with proper error handling.
    */
    static fetchCuisines() {
        return new Promise((resolve, reject) => {
            // Fetch all restaurants
            DBHelper.fetchRestaurants().then(restaurants => {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
                return resolve(uniqueCuisines);
            }).catch(error => {
                return reject(error);
            });
        });
    }

    /**
    * Restaurant page URL.
    */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
    * Restaurant image URL.
    */
    static imageUrlForRestaurant(restaurant) {
        let photograph = restaurant.photograph + '-800-l.jpg';
        return (`/img/${photograph}`);
    }

    /**
    * Map marker for a restaurant.
    */
    static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
            position: restaurant.latlng,
            title: restaurant.name,
            url: DBHelper.urlForRestaurant(restaurant),
            map: map,
            animation: google.maps.Animation.DROP}
        );
        return marker;
    }

}
