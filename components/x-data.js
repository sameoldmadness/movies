customElements.define('x-data', class extends HTMLElement {
  connectedCallback() {
    this._fetchPayload();
  }

  _fetchPayload() {
    fetch('https://data.sfgov.org/resource/wwmu-gmzc.json')
      .then(res => res.json())
      .then(this._locationsFromJson)
      .then(locations => {
        this.value = locations;
        this.dispatchEvent(new CustomEvent('load'));
      });
  }

  _locationsFromJson(json) {
    return json.map(row => {
      return Object.keys(row).reduce((location, name) => {
        const key = x.str.camelize(name);

        location[key] = row[name];

        return location;
      }, {});
    });
  }
});
