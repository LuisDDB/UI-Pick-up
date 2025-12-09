import { environment } from "../config/environment.js";

class StoreCard extends HTMLElement {
  connectedCallback() {
    const id = this.getAttribute('store-id') || '';
    const name = this.getAttribute('name') || '';
    const address = this.getAttribute('address') || '';
    const phone = this.getAttribute('phone') || '';
    const schedule = this.getAttribute('schedule') || '';

    this.innerHTML = `
      <style>
        @import url(${environment.URL_Home}/style/home.css);
      </style>
      <article class="store-card" role="button" tabindex="0" data-id="${id}">
        <h3>${escapeHtml(name)}</h3>
        <p class="detail-item"><strong>Dirección:</strong> ${escapeHtml(address)}</p>
        <p class="detail-item"><strong>Tel:</strong> ${escapeHtml(phone || '—')}</p>
        <p class="detail-item"><strong>Horario:</strong> ${escapeHtml(schedule || '—')}</p>
        <div class="actions">
          <button class="open-store">Ver productos</button>
        </div>
      </article>
    `;

    this.querySelector('.open-store').addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('navigate', { detail:{ url: `/store/${id}` } }));
    });
    this.querySelector('.store-card').addEventListener('keypress', e => {
      if (e.key === 'Enter') this.querySelector('.open-store').click();
    });
  }
}

customElements.define('mfe-card', StoreCard);

function escapeHtml(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
