customElements.define('x-app', class extends HTMLElement {
  connectedCallback() {
    this._initEvents();
    this._registerServiceWorker();
  }

  _initEvents() {
    const data = this.querySelector('x-data');
    const map = this.querySelector('x-map');
    const range = this.querySelector('x-range');

    data.addEventListener('load', _ => {
      map.locations = data.value;
    });

    range.addEventListener('change', _ => {
      map.setAttribute('year', range.getAttribute('value'));
    });
  }

  _registerServiceWorker() {
    navigator.serviceWorker.register('sw.js');
  }
});
