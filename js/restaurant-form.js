document.addEventListener('DOMContentLoaded', (event) => {
  DBHelper.openDatabase();
  listenFormSubmit();
});

/**
 * List for form submit
 */
listenFormSubmit = () => {
  document.querySelector('#new-restaurant-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = getParameterByName('id');
    if (id) {
      const valuesArray = new FormData(e.srcElement);
      const values = {};
      for(let value of valuesArray) {
        values[value[0]] = value[1];
      }
      values['id'] = id;
      DBHelper.submitReview(values).then(() => {
        alert('Review submitted successfully');
        window.location.href = '/';
      }).catch(() => {
        alert('Error saving your review. If your internet is disconnected we will try to submit it again when it reconnects.');
        sessionStorage.setItem('submitReview', JSON.stringify(values));
      });
    }
  });
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