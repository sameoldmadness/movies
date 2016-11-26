document.registerElement('x-range', class extends HTMLElement {
  attachedCallback() {
    this._initShadowDom();
    this._initEvents();
  }

  get value() {
    return parseInt(this.$.value.textContent, 10);
  }

  set value(val) {
    const min = this.getAttribute('from');
    const max = this.getAttribute('to');

    this.$.value.textContent = x.inBounds(val, min, max);
  }

  _initShadowDom() {
    const shadowRoot = this.attachShadow({mode: 'open'});
    const template = document.querySelector('#x-range-template');
    const instance = template.content.cloneNode(true);

    shadowRoot.appendChild(instance);

    this.$ = {};
    this.$.value = this.shadowRoot.querySelector('#value');
    this.$.range = this.shadowRoot.querySelector('#range');
  }

  _initEvents() {
    this.$.range.addEventListener('touchstart', e => {
      const x = this._extractX(e);

      this._enterEditMode(x);
    });

    this.$.range.addEventListener('touchmove', x.throttle(e => {
      const x = this._extractX(e);

      this._updateValue(x);
    }, 100));

    this.$.range.addEventListener('touchend', _ => {
      this._leaveEditMode();
    });
  }

  _enterEditMode(x) {
    this.$.value.removeAttribute('hidden');
    this._x = x;
  }

  _leaveEditMode() {
    this.$.value.setAttribute('hidden', '');
    this._x = null;
    this.dispatchEvent(new CustomEvent('change', { value: this.value }));
  }

  _updateValue(x) {
    if (this._x === null) return; // touchend has been fired

    const speed = 0.1;
    const delta = Math.round((x - this._x) * speed);

    this.value += delta;
    this._x = x;
  }

  _extractX(e) {
    return e.targetTouches[0].clientX;
  }
});
