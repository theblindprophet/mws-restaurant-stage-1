const idb_name = 'mws-db';
const idb_version = 1;
let dbPromise = null;

/**
* Common database helper functions.
*/
class DBHelper {

  /**
  * Fetch all restaurants.
  */
  static fetchRestaurants() {
    return new Promise((resolve, reject) => {
      DBHelper.fetchRestaurantsFromIDB().then(restaurants => {
        if(!restaurants || restaurants.length == 0) {
          fetch('http://localhost:1337/restaurants').then(response => {
            response.json().then(data => {
              DBHelper.writeRestautantsToIDB(data);
              return resolve(data);
            });
          }).catch(error => {
            return reject(error);
          });
        } else {
          fetch('http://localhost:1337/restaurants').then(response => {
            response.json().then(data => {
              DBHelper.writeRestautantsToIDB(data);
            });
          });
          return resolve(restaurants);
        }
      }).catch(error => {
        return reject(error);
      });
    });
  }

  /**
   * Fetch reviews and store in IDB
   */
  static fetchReviews(restaurant_id) {
    return new Promise((resolve, reject) => {
      DBHelper.fetchReviewsFromIDB(restaurant_id).then(reviews => {
        if(!reviews || reviews.length == 0) {
          fetch(`http://localhost:1337/reviews?restaurant_id=${restaurant_id}`).then(response => {
            response.json().then(data => {
              DBHelper.writeReviewsToIDB(data);
              return resolve(data);
            });
          }).catch(error => {
              return reject(error);
          });
        } else {
          fetch(`http://localhost:1337/reviews?restaurant_id=${restaurant_id}`).then(response => {
            response.json().then(data => {
              DBHelper.writeReviewsToIDB(data);
            });
          })
          return resolve(reviews);
        }
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
   * Submit restaurant review
   */
  static submitReview(review) {
    return new Promise((resolve, reject) => {
      fetch(`http://localhost:1337/reviews`, {
        method: 'POST',
        body: JSON.stringify(review)
      }).then(response => {
        return resolve(response);
      }).catch(error => {
        return reject(error);
      });
    });
  }

  /**
   * Favorite a restaurant
   */
  static favoriteRestaurant(id, favorite) {
    return new Promise((resolve, reject) => {
      fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=${favorite}`, {
        method: 'PUT'
      }).then(response => {
        return resolve(response);
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

  /**
   * Write new values to database
   */
  static writeRestautantsToIDB(restaurants) {
      DBHelper.openDatabase().then(db => {
          const tx = db.transaction('restaurants', 'readwrite');
          let i = 0;
          putNext();
          function putNext() {
              if(i < restaurants.length) {
                  tx.objectStore('restaurants').put(restaurants[i]).then(putNext);
                  ++i;
              } else {
                  console.log("Finished adding restaurants to database");
              }
          }
      });
  }

  /**
   * Retrieve restaurants from IDB
   */
  static fetchRestaurantsFromIDB() {
    return new Promise((resolve, reject) => {
        dbPromise.then(db => {
            db.transaction('restaurants').objectStore('restaurants').getAll().then(restaurants => {
                return resolve(restaurants);
            }).catch(error => {
                return reject(error);
            });
        });
    });
  }

  /**
   * Write new values to database
   */
  static writeReviewsToIDB(reviews) {
    DBHelper.openDatabase().then(db => {
      const tx = db.transaction('reviews', 'readwrite');
      let i = 0;
      putNext();
      function putNext() {
        if(i < reviews.length) {
          tx.objectStore('reviews').put(reviews[i]).then(putNext);
          ++i;
        } else {
          console.log("Finished adding reviews to database");
        }
      }
    });
  }

  /**
   * Get reviews from IDB
   */
  static fetchReviewsFromIDB(restaurant_id) {
    return new Promise((resolve, reject) => {
      dbPromise.then(db => {
        db.transaction('reviews').objectStore('reviews').index('restaurant_id').getAll(parseInt(restaurant_id)).then(reviews => {
          return resolve(reviews);
        }).catch(error => {
          return reject(error);
        });
      });
    });
  }

  /**
  * Create IDB database
  */
  static openDatabase() {
    // If the browser doesn't support service worker,
    // we don't care about having a database
    if (!navigator.serviceWorker) {
        return Promise.resolve();
    }

    dbPromise = idb.open(idb_name, idb_version, db => {
      const restaurantStore = db.createObjectStore('restaurants', {
          keyPath: 'id'
      });
      restaurantStore.createIndex('id', 'id', {unique: true});
      const reviewStore = db.createObjectStore('reviews', {
        keyPath: 'id'
      });
      reviewStore.createIndex('restaurant_id', 'restaurant_id', {unique: false});
    });
    return dbPromise;
  }
}

const submittedReview = sessionStorage.getItem('submitReview');
if (submittedReview) {
  DBHelper.submitReview(JSON.parse(submittedReview)).then(() => {
    sessionStorage.removeItem('submitReview');
  });
}