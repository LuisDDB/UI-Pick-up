import { environment } from "../config/environment.js";

class ProductCard extends HTMLElement {
  set product(p) {
    this._product = p;
    this.render();
  }

  render() {
    const p = this._product;
    if (!p) return;
    this.innerHTML = `
      <style>
        @import url(${environment.URL_Store}/style/product.css);
      </style>
      <article class="product-card" data-id="${p.product_id}">
        <img src="${p.image || '/placeholder.png'}" alt="${escapeHtml(p.name)}" />
        <div class="meta">
          <h4>${escapeHtml(p.name)}</h4>
          <p class="price">$${Number(p.price).toFixed(2)}</p>
          <div class="controls">
            <button class="btn-detail">Ver</button>
            <button class="btn-add">Agregar</button>
          </div>
        </div>
      </article>
    `;

    this.querySelector('.btn-detail').addEventListener('click', () => {
      // show detail component (modal)
      const detail = document.createElement('mfe-product-detail');
      detail.product = this._product;
      document.body.appendChild(detail);
      detail.show();
    });

    this.querySelector('.btn-add').addEventListener('click', () => {
      addToCart(this._product, 1);
      window.dispatchEvent(new Event('cart-updated'));
      this.querySelector('.btn-add').textContent = 'Agregado ✓';
      setTimeout(()=> this.querySelector('.btn-add').textContent = 'Agregar', 900);
    });
  }
}

customElements.define('mfe-product-card', ProductCard);

function escapeHtml(s = '') {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// carrito: guardar por store_id
function getCart() {
  const raw = localStorage.getItem('pickup_cart_v1');
  return raw ? JSON.parse(raw) : {};
}

function saveCart(cart) {
  localStorage.setItem('pickup_cart_v1', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
}

function addToCart(product, qty=1) {
  const cart = getCart();
  const storeId = product.store_id || product.storeId || 'default';
  if (!cart[storeId]) cart[storeId] = {};
  const key = String(product.product_id);
  if (!cart[storeId][key]) {
    cart[storeId][key] = { ...product, qty };
  } else {
    cart[storeId][key].qty += qty;
  }
  saveCart(cart);
}
