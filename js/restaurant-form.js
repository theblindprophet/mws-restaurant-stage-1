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
      // TODO: Submit values to API, detect failues, save response to session
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