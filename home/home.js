import "./components/storeCard.js";
import { environment } from "../config/environment.js";

class Home extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        @import url(${environment.URL_Home}/style/home.css);
      </style>
      <section class="home">
        <h1>Elige la tienda que más te guste</h1>
        <div id="stores" class="container"></div>
      </section>
    `;
    this.loadStores();
  }

  async getStores(){
    try{
      const res = await fetch(`${environment.URL_API}/store`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error cargando tiendas');
      return data; 
    } catch(err) {
      console.error(err);
      return [];
    }
  }

  async loadStores() {
    const stores = await this.getStores();
    const container = this.querySelector('#stores');
    container.innerHTML = '';
    if (stores.length === 0) {
      container.innerHTML = '<p>No se encontraron tiendas.</p>';
      return;
    }
    stores.forEach(store => {
      const card = document.createElement('mfe-card');
      card.setAttribute('store-id', store.store_id);
      card.setAttribute('name', store.name);
      card.setAttribute('address', store.address || '');
      card.setAttribute('phone', store.phone || '');
      card.setAttribute('schedule', store.schedule || '');
      container.appendChild(card);
    });
  }
}

customElements.define('mfe-home', Home);
