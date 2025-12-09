import "./components/productCard.js";
import { environment } from "../config/environment.js";

class product extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        @import url(${environment.URL_Store}/style/store.css);
      </style>
      <section class="products">
        <button id="backBtn">← Volver</button>
        <h2 id="storeName">Tienda</h2>
        <div id="products" class="products-grid"></div>
      </section>
    `;
    this.init();
  }

  async init() {
    const id = this._getStoreId();
    if (!id) return this.showError('ID de tienda inválido');
    this.storeId = id;
    localStorage.setItem("idTienda", this.storeId);
    await this.loadStoreInfo();
    await this.loadProducts();
  }

  _getStoreId() {
    const parts = window.location.pathname.split('/');
    return parts[2] || null;
  }

  async loadStoreInfo() {
    try {
      const res = await fetch(`${environment.URL_API}/store/${this.storeId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'No se pudo cargar tienda');
      this.querySelector('#storeName').textContent = data.name;
    } catch (e) {
      console.error(e);
    }
    this.querySelector('#backBtn').addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('navigate', { detail:{ url: '/' } }));
    });
  }

  async loadProducts() {
    try {
      const res = await fetch(`${environment.URL_API}/product/store/${this.storeId}`,{
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al cargar productos');
      const grid = this.querySelector('#products');
      grid.innerHTML = '';
      data.forEach(p => {
        const pc = document.createElement('mfe-product-card');
        pc.product = { ...p, store_id: this.storeId };
        grid.appendChild(pc);
      });
    } catch (e) {
      console.error(e);
      this.showError('Error al cargar productos');
    }
  }

  showError(msg) {
    const grid = this.querySelector('#products');
    grid.innerHTML = `<p class="error">${msg}</p>`;
  }
}

customElements.define('mfe-store', product);
