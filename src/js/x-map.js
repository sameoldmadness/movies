customElements.define('x-map', class extends HTMLElement {
  connectedCallback() {
    this.locations = [];
    this._mapReady = new x.Deferred();

    this._initShadowDom();

    const callback = x.jsonp.register(_ => {
      this._onReady();
      x.jsonp.clear(callback);
    });

    x.loadScript(this._makeUrl(callback));
  }

  static get observedAttributes() {
    return ['year'];
  }

  attributeChangedCallback(attrName, _, newVal) {
    switch(attrName) {
    case 'year':
      this._updateMarkers(newVal);
      break;
    }
  }

  _makeUrl(callback) {
    const url = new URL('https://maps.googleapis.com/maps/api/js');

    url.searchParams.set('key', this.getAttribute('key'));
    url.searchParams.set('callback', callback);

    return url.toString();
  }

  _initShadowDom() {
    const shadowRoot = this.attachShadow({mode: 'open'});
    const template = document.querySelector('#x-map-template');
    const instance = template.content.cloneNode(true);

    shadowRoot.appendChild(instance);
  }

  _makeMap() {
    const mapEl = this.shadowRoot.querySelector('#map');

    return new google.maps.Map(mapEl, {
      center: {lat: 37.8008245, lng: -122.4533048},
      zoom: 12,
    });
  }

  _onReady() {
    this._markers = [];

    this._mapReady.resolve(this._makeMap());
  }

  _updateMarkers(year) {
    this._clearMarkers();

    this._mapReady.promise
      .then(this._getLocationsByYear.bind(this, year))
      .then(this._getLocationsWithPositions.bind(this))
      .then(this._addMarkers.bind(this));
  }

  _addMarkers(locations) {
    return this._mapReady.promise.then(map => {
      locations.forEach(({position, title}) => {
        const marker = new google.maps.Marker({ position, map, title });

        this._markers.push(marker);
      });
    });
  }

  _clearMarkers() {
    this._markers.forEach(marker => marker.setMap(null));
    this._markers = [];
  }

  _getLocationsByYear(year) {
    return this.locations.filter(x => x.releaseYear === year);
  }

  _getLocationsWithPositions(locations) {
    return Promise
      .all(locations.map(location => this._injectPosition(location)))
      .then(locations => locations.filter(location => {
        return location.position;
      }));
  }

  _injectPosition(location) {
    return this._fetchGeocode(location.locations).then(res => {
      return res !== '' ? Object.assign(location, { position: {
        lat: res.geometry.location.lat(),
        lng: res.geometry.location.lng()
      }}) : location;
    });
  }

  _fetchGeocode(address) {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({address}, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          resolve(results[0]);
        } else {
          resolve('');
        }
      });
    });
  }
});
