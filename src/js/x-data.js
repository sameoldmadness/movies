customElements.define('x-data', class extends HTMLElement {
  connectedCallback() {
    this._fetchPayload();
  }

  _fetchPayload() {
    fetch('data/film-locations.json')
      .then(res => res.json())
      .then(this._locationsFromJson)
      .then(locations => {
        this.value = locations;
        this.dispatchEvent(new CustomEvent('load'));
      });
  }

  _locationsFromJson(json) {
    const whitelist = ['title', 'releaseYear', 'locations'];
    const columns = json.meta.view.columns.map(x => x.name);

    return json.data.map(row => {
      return columns.reduce((location, name, index) => {
        const key = x.str.camelize(name);

        if (whitelist.includes(key)) {
          location[key] = row[index];
        }

        return location;
      }, {});
    });
  }
});
