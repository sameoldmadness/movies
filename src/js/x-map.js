document.registerElement('x-map', class extends HTMLElement {
  createdCallback() {
    this._initShadowDom();

    const callback = this._makeGlobalFunction(_ => {
      this._onReady();
      this._clearGlobalFunction(callback);
    });

    x.loadScript(this._makeUrl(callback));
  }

  _makeUrl(callback) {
    const url = new URL('https://maps.googleapis.com/maps/api/js');

    url.searchParams.set('key', this.getAttribute('key'));
    url.searchParams.set('callback', callback);

    return url.toString();
  }

  _makeGlobalFunction(fn) {
    const name = 'myMap' + String(Math.random()).slice(2);

    window[name] = fn;

    return name;
  }

  _clearGlobalFunction(name) {
    window[name] = null;
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
    this.map = this._makeMap();
    this.dispatchEvent(new CustomEvent('ready'));
  }
});
