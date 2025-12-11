import { environment } from "../config/environment.js";

class ProductCard extends HTMLElement {
    set product(p) {
        this._product = p;
        if (!p) return;
        
        const isCustomer = !p.isAdmin; 
        const isStoreAdmin = p.isAdmin;

        let controlsHtml = '';

        if (isCustomer) {
            controlsHtml = `
                <button class="btn-detail">Ver</button>
                <button class="btn-add">Agregar</button>
            `;
        } else if (isStoreAdmin) {
            controlsHtml = `
                <button class="btn-edit"> Editar</button>
                <button class="btn-delete"> Eliminar</button>
            `;
        }

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
                        ${controlsHtml}
                    </div>
                </div>
            </article>
        `;

        if (isCustomer) {
            this.querySelector('.btn-detail').addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent("open-detail", {
                    bubbles: true,
                    composed: true,
                    detail: { product: this._product }
                }));
            });

            this.querySelector('.btn-add').addEventListener('click', () => {
                const account = JSON.parse(localStorage.getItem("user"));
                let typeAccount = account ? account.type : "NOTLOG";
                if (typeAccount === "NOTLOG") {
                    const modal = document.createElement("mfe-login");
                    document.body.appendChild(modal);
                } else if (typeAccount === "CLIENT") {
                    addToCart(this._product, 1);
                    window.dispatchEvent(new Event('cart-updated'));
                    this.querySelector('.btn-add').textContent = 'Agregado ✓';
                    setTimeout(() => this.querySelector('.btn-add').textContent = 'Agregar', 900);
                }
            });
        } else if (isStoreAdmin) {
            this.querySelector('.btn-edit').addEventListener('click', () => {
                console.log(`Editar producto: ${p.product_id}`);
            });

            this.querySelector('.btn-delete').addEventListener('click', () => {
                if (confirm(`¿Estás seguro de que quieres eliminar ${p.name}?`)) {
                    this._deleteProduct(p.product_id);
                }
            });
        }
    }

    async _deleteProduct(productId) {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await fetch(`${environment.URL_API}/product/${productId}`, {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user ? user.token : ''}` 
                },
            });

            if (res.ok) {
                window.dispatchEvent(new CustomEvent('product-updated')); 
            } else {
                const data = await res.json();
                alert('Error al eliminar producto: ' + (data.message || 'Desconocido'));
            }
        } catch (error) {
            console.error('Error al intentar eliminar:', error);
            alert('Error de conexión al intentar eliminar el producto.');
        }
    }
}

customElements.define('mfe-product-card', ProductCard);

function escapeHtml(s = '') {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getCart() {
    const raw = localStorage.getItem('pickup_cart_v1');
    return raw ? JSON.parse(raw) : {};
}

function saveCart(cart) {
    localStorage.setItem('pickup_cart_v1', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
}

function addToCart(product, qty = 1) {
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