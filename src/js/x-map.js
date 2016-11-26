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
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const template = document.querySelector('#x-map-template');
    const instance = template.content.cloneNode(true);

    shadowRoot.appendChild(instance);
  }

  _makeMap() {
    const mapEl = this.shadowRoot.querySelector('#map');

    return new google.maps.Map(mapEl, {
      center: { lat: 37.8008245, lng: -122.4533048 },
      zoom: 12,
      disableDefaultUI: true,
    });

    return map;
  }

  _onReady() {
    this._markers = [];
    this._infowindows = [];

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
      locations.forEach(({ position, title, actor1, actor2, funFacts, locations, releaseYear }) => {
        const marker = new google.maps.Marker({ position, map, title });

        const infowindow = new google.maps.InfoWindow({
          content: `
            <h3>${locations}</h3>
            <p>${[actor1, actor2].join(' and ')} in "${title}".</p>
            <p>${funFacts || ''}</p>
          `,
          maxWidth: 200
        });

        marker.addListener('click', _ => {
          const isOpened = Boolean(infowindow._opened);

          this._closeInfowindows();

          if (!isOpened) {
            infowindow.open(map, marker);
            infowindow._opened = true;
          }
        });

        this._markers.push(marker);
        this._infowindows.push(infowindow);
      });
    });
  }

  _clearMarkers() {
    this._markers.forEach(marker => marker.setMap(null));
    this._markers = [];

    this._closeInfowindows();
    this._infowindows = [];
  }

  _closeInfowindows() {
    this._infowindows.forEach(infowindow => {
      infowindow.close();
      infowindow._opened = false;
    });
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

      geocoder.geocode({ address }, (results, status) => {
        const position = status === google.maps.GeocoderStatus.OK ? results[0] : '';

        resolve(position);
      });
    });
  }
});
