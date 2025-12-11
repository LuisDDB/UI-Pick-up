import { environment } from "./config/environment.js";

const TRANSITION_DURATION_MS = 300;

class ProductDetail extends HTMLElement {
    set product(p) {
        this._product = p;
    }

    connectedCallback() {
        this.render();

        setTimeout(() => {
            const backdrop = this.querySelector('.product-modal-backdrop');
            if (backdrop) {
                backdrop.classList.add('is-open');
            }
        }, 0);
    }

    _closeModal() {
        const backdrop = this.querySelector('.product-modal-backdrop');
        if (backdrop) {
            backdrop.classList.remove('is-open');
            setTimeout(() => {
                this.remove();
            }, TRANSITION_DURATION_MS);
        } else {
            this.remove();
        }
    }

    render() {
        const p = this._product || {};
        this.innerHTML = `
            <style>
                @import url(${environment.URL_Detail}/style/productDetail.css);
            </style>
            
            <div class="product-modal-backdrop">
                <div class="product-modal">
                    <button class="close" type="button">×</button>
                    <div class="media">
                        <img src="${p.image || '/placeholder.png'}" alt="${p.name}">
                    </div>
                    <div class="info">
                        <h3>${p.name}</h3>
                        <p class="price">$${Number(p.price || 0).toFixed(2)}</p>
                        <p class="desc">${p.description || ''}</p>
                        <div class="qty">
                            <label>Cantidad:</label>
                            <input type="number" min="1" value="1" class="qty-input"/>
                        </div>
                        <div class="actions">
                            <button class="add" type="button">Agregar al carrito</button>
                        </div>
                    </div>
                </div>
            </div>
        `;


        this.querySelectorAll('.close').forEach(btn => btn.addEventListener('click', () => this._closeModal()));

        this.querySelector('.product-modal-backdrop').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this._closeModal();
            }
        });

        this.querySelector('.add').addEventListener('click', () => {
            const account = JSON.parse(localStorage.getItem("user"));
            let typeAccount = account ? account.type : "NOTLOG";
            if (typeAccount === "NOTLOG") {
                const modal = document.createElement("mfe-login");
                document.body.appendChild(modal);
            } else if(typeAccount==="CLIENT"){
                const qty = Math.max(1, Number(this.querySelector('.qty-input').value || 1));
                const product = { ...this._product, store_id: this._product.store_id || this._product.storeId };
                addToCart(product, qty);
                window.dispatchEvent(new Event('cart-updated'));
                this._closeModal();
            }

        });
    }

}

customElements.define('mfe-product-detail', ProductDetail);

function getCart() {
    const raw = localStorage.getItem('pickup_cart_v1');
    return raw ? JSON.parse(raw) : {};
}
function saveCart(cart) { localStorage.setItem('pickup_cart_v1', JSON.stringify(cart)); window.dispatchEvent(new Event('cart-updated')); }
function addToCart(product, qty = 1) {
    const cart = getCart();
    const storeId = product.store_id || 'default';
    if (!cart[storeId]) cart[storeId] = {};
    const key = String(product.product_id);
    if (!cart[storeId][key]) cart[storeId][key] = { ...product, qty };
    else cart[storeId][key].qty += qty;
    saveCart(cart);
}