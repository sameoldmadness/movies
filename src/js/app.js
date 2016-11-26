const rangeEl = document.querySelector('input[type="range"]');
const yearEl = document.querySelector('#year');

const getLocations = memoize(fetchLocations);
const getGeocode = memoize(fetchGeocode);
const mapsReadyDeferred = new Deferred();
const mapsReady = mapsReadyDeferred.promise;

let markers = [];

rangeEl.addEventListener('input', debounce(onRangeUpdate, 500));
rangeEl.addEventListener('input', () => yearEl.textContent = rangeEl.value);
fireEvent('input', rangeEl);

function onRangeUpdate() {
  const year = rangeEl.value;

  markers.forEach(marker => marker.setMap(null));
  markers = [];

  getLocations()
    .then(xs => xs.filter(x => x.releaseYear === year))
    .then(locations => Promise.all(locations.map(location => {
      const address = location.locations;

      if (address === null) return;

      return getGeocode(address).then(res => {
        if (res === '') return;

        const position = {
          lat: res.geometry.location.lat(),
          lng: res.geometry.location.lng()
        };

        mapsReady.then(map => {
          markers.push(new google.maps.Marker({
            position,
            map,
            title: location.title
          }));
        })
      });
    })));
}

function debounce(fn, delay) {
  let start;

  return (...args) => {
    const now = Date.now();

    if (now - start < delay) return;

    start = now;
    fn(...args);
  };
}

function fireEvent(name, node) {
  const event = document.createEvent("HTMLEvents");

  event.initEvent(name, false, true);
  node.dispatchEvent(event);
}

function memoize(fn) {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return Promise.resolve(cache.get(key));
    }

    return fn(...args).then(res => {
      cache.set(key, res);

      return res;
    });
  }
}

function fetchLocations() {
  return fetch('data/film-locations.json')
    .then(res => res.json())
    .then(locationsFromJson);
}

function locationsFromJson(json) {
  const columns = json.meta.view.columns.map(x => x.name);
      
  return json.data.map(row => {
    return columns.reduce((location, name, index) => {
      location[camelize(name)] = row[index];

      return location;
    }, {});
  });
}

function ucFirst(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function lcFirst(str) {
  return str[0].toLowerCase() + str.slice(1);
}

function camelize(str) {
  return lcFirst(str
    .replace(/\s/g, '')
    .split('_')
    .map(ucFirst)
    .join(''));
}

/** 
 * @copyright wbinnssmith 
 * @link https://github.com/wbinnssmith/promise-deferred/blob/master/index.js
 */
function Deferred() {
  this.promise = new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
};

function fetchGeocode(address) {
  return new Promise((resolve, reject) => {
    mapsReady.then(() => {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({address}, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          resolve(results[0]);
        } else {
          resolve('');
        }
      });
    });
  });
}

const mapEl = document.querySelector('my-map')

mapEl.addEventListener('ready', _ => {
  mapsReadyDeferred.resolve(mapEl.map);
  console.log('Yay map is ready!');
});