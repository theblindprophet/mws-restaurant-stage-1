let restaurant;
var map;

document.addEventListener('DOMContentLoaded', (event) => {
  DBHelper.openDatabase();
  listenForNewReview();
  fetchReviewsForRestaurant();
});

/**
* Initialize Google map, called from HTML.
*/
window.initMap = () => {
  fetchRestaurantFromURL().then(restaurant => {
    self.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 16,
      center: restaurant.latlng,
      scrollwheel: false
    });
    fillBreadcrumb();
    DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
  }).catch(error => {
      console.error(error);
  });
}

/**
* Get current restaurant from page URL.
*/
fetchRestaurantFromURL = () => {
  return new Promise((resolve, reject) => {
    if(self.restaurant) { // restaurant already fetched!
      return resolve(self.restaurant)
    }
    const id = getParameterByName('id');
    if(!id) { // no id found in URL
      return reject('No restaurant id in URL');
    } else {
      DBHelper.fetchRestaurantById(id).then(restaurant => {
        self.restaurant = restaurant;
        fillRestaurantHTML();
        return resolve(restaurant)
      }).catch(error => {
        return reject(error);
      });
    }
  });
}

/**
* Create restaurant HTML and add it to the webpage
*/
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img'
    image.src = DBHelper.imageUrlForRestaurant(restaurant);

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
      fillRestaurantHoursHTML();
    }
}

/**
* Create restaurant operating hours HTML table and add it to the webpage.
*/
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
* Create all reviews HTML and add them to the webpage.
*/
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.prepend(title, container.firstChild);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.style.textAlign = 'center';
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
* Create review HTML and add it to the webpage.
*/
createReviewHTML = (review) => {
    const li = document.createElement('li');
    const name = document.createElement('p');
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('p');
    const dataObj = new Date(review.updatedAt)
    date.innerHTML = dataObj.toISOString().substr(0, 10);
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
}

fetchReviewsForRestaurant = () => {
  const id = getParameterByName('id');
  if(id) {
    DBHelper.fetchReviews(id).then(reviews => {
      // fill reviews
      fillReviewsHTML(reviews);
    }).catch(err => {
      console.log(err);
    });
  }
}

/**
* Add restaurant name to the breadcrumb navigation menu
*/
fillBreadcrumb = (restaurant=self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
}

/**
* Get a parameter by name from page URL.
*/
getParameterByName = (name, url) => {
    if (!url)
    url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
    if (!results)
    return null;
    if (!results[2])
    return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

listenForNewReview = () => {
  document.querySelector('#add-review').addEventListener('click', () => {
    const id = getParameterByName('id');
    if (id) {
      window.location.href = `/restaurant-form.html?id=${id}`;
    }
  });
}
