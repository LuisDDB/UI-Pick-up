import { environment } from "../config/environment.js";

class CartComponent extends HTMLElement {
    isCartOpen = false; 

    connectedCallback() {
        this.innerHTML = `
            <style>
                @import url(${environment.URL_Cart}/style/cart.css);
            </style>

            <aside class="cart-panel" id="cartPanel">
                <div class="cart-header">
                    <h3>Carrito</h3>
                    <button class="close-cart" id="closeCart">✕</button>
                </div>

                <div class="cart-items" id="cartItemsContainer"></div> 

                <div class="cart-footer">
                    <div class="cart-summary">
                        <span>Total:</span>
                        <strong id="cartTotal">$0.00</strong> 
                    </div>
                    <button id="toCheckout">Ir a pagar</button>
                </div>
            </aside>
        `;

       
        this.addStaticEventListeners();
        this.updateCartContent(); 

        window.addEventListener('cart-updated', () => {
            this.updateCartContent();
            if (!this.isCartOpen) {
                this.open();
            }
        });
    }

    addStaticEventListeners() {
        this.querySelector('#closeCart').addEventListener('click', () => this.close());
        
        const toCheck = this.querySelector('#toCheckout');
        if (toCheck) {
            toCheck.addEventListener('click', () => {
                window.dispatchEvent(
                    new CustomEvent('navigate', { detail: { url: '/checkout' } })
                );
                this.close();

            });
        }
    }

    updateCartContent() {
        const cart = JSON.parse(localStorage.getItem('pickup_cart_v1') || '{}');
        const currentStore = this.getAttribute('store-id') || getCurrentStoreFromPath();
        const items = cart[currentStore] ? Object.values(cart[currentStore]) : [];
        const total = items.reduce((s, i) => s + (Number(i.price) * i.qty), 0);
        
        const itemsContainer = this.querySelector('#cartItemsContainer');
        const totalElement = this.querySelector('#cartTotal');
        const checkoutButton = this.querySelector('#toCheckout');

        const itemsHTML = items.length === 0
            ? "<p style='text-align: center; color: #6B7280; padding-top: 1rem;'>Carrito vacío</p>"
            : items
                .map((i) => `
                    <div class="cart-item" data-id="${i.product_id}">
                        <img src="${i.image || '/placeholder.png'}" alt="${i.name}">
                        <div class="ci-meta">
                            <div class="ci-name">${i.name}</div>
                            <div class="ci-price">$${(i.price * i.qty).toFixed(2)}</div>
                        </div>
                        <div class="ci-actions">
                            <div class="qty-control">
                                <button class="dec" data-id="${i.product_id}">−</button>
                                <span>${i.qty}</span>
                                <button class="inc" data-id="${i.product_id}">+</button>
                            </div>
                            <button class="rem remove-item" data-id="${i.product_id}">Eliminar</button>
                        </div>
                    </div>`
                )
                .join("");

        itemsContainer.innerHTML = itemsHTML;
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
        if (checkoutButton) checkoutButton.disabled = items.length === 0;

        this.querySelectorAll('.inc').forEach((b) =>
            b.addEventListener('click', (e) => this.changeQty(e, +1))
        );
        this.querySelectorAll('.dec').forEach((b) =>
            b.addEventListener('click', (e) => this.changeQty(e, -1))
        );
        this.querySelectorAll('.rem').forEach((b) =>
            b.addEventListener('click', (e) => this.removeItem(e))
        );
    }

    changeQty(e, delta) {
        const id = e.target.dataset.id;
        const cart = JSON.parse(localStorage.getItem('pickup_cart_v1') || '{}');
        const storeId = this.getAttribute('store-id') || getCurrentStoreFromPath();

        if (!cart[storeId] || !cart[storeId][id]) return;

        cart[storeId][id].qty = Math.max(1, (cart[storeId][id].qty || 1) + delta);

        localStorage.setItem('pickup_cart_v1', JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));
    }

    removeItem(e) {
        const id = e.target.dataset.id;
        const cart = JSON.parse(localStorage.getItem('pickup_cart_v1') || '{}');
        const storeId = this.getAttribute('store-id') || getCurrentStoreFromPath();

        if (cart[storeId] && cart[storeId][id]) delete cart[storeId][id];

        localStorage.setItem('pickup_cart_v1', JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));
    }

    open() {
        this.isCartOpen = true; 
        this.querySelector("#cartPanel")?.classList.add("open");
    }

    close() {
        this.isCartOpen = false; 
        this.querySelector("#cartPanel")?.classList.remove("open");
    }
}

customElements.define('mfe-cart', CartComponent);

function getCurrentStoreFromPath() {
    const parts = window.location.pathname.split('/');
    return parts[2] || 'default';
}