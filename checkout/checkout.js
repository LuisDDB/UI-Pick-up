import { environment } from "./config/environment.js";

class Checkout extends HTMLElement {

    connectedCallback() {
        this.innerHTML = `
      <style>
        @import url(${environment.URL_Checkout}/style/checkout.css);
      </style>
      <section class="checkout">
        <button id="back">← Volver</button>
        <h2>Resumen del pedido</h2>
        <div id="summary"></div>
        <div id="actions"></div>
      </section>
    `;
        this.init();
    }

    init() {
        this.storeId = localStorage.getItem("idTienda");
        this.clienData = JSON.parse(localStorage.getItem("user"))
        this.renderSummary();
        this.querySelector('#back').addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: { url: `/store/${this.storeId}` } }));
        });
    }
    

    renderSummary() {
        const cart = JSON.parse(localStorage.getItem('pickup_cart_v1') || '{}');
        const items = cart[this.storeId] ? Object.values(cart[this.storeId]) : [];
        this.total = items.reduce((s, i) => s + (i.qty * Number(i.price)), 0);
        const sumEl = this.querySelector('#summary');
        if (items.length === 0) {
            sumEl.innerHTML = '<p>No hay productos en el carrito para esta tienda.</p>';
            this.querySelector('#actions').innerHTML = '';
            return;
        }

        sumEl.innerHTML = `
      <ul class="checkout-list">
        ${items.map(i => `<li>${i.name} x${i.qty} — $${(i.price * i.qty).toFixed(2)}</li>`).join('')}
      </ul>
      <div class="total">Total: <strong>$${this.total.toFixed(2)}</strong></div>
    `;

        this.querySelector('#actions').innerHTML = `
      <form id="orderForm">
        <label>Nombre:</label><input name="customer_name" required />
        <label>Teléfono:</label><input name="customer_phone" required />
        <label>Notas:</label><textarea name="notes"></textarea>
        <button type="submit">Generar pedido y obtener QR</button>
      </form>
      <div id="qrWrap"></div>
    `;
        this.querySelector('#orderForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = new FormData(e.target);
            const payload = {
                order_date: this.formatDateTime(new Date()),
                state: "PENDIENTE",
                total: this.total,
                client_id: this.clienData.id,
                store_id: this.storeId,
                pickup_code: Math.random().toString(36).substring(2, 10).toUpperCase()
            };
            await this.createOrder(payload);
        });
    }

    formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    

    async createOrder(payload) {
        try {
            console.log("data client", this.clienData.token);


            const res = await fetch(`${environment.URL_API}/order/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${this.clienData.token}`
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(res || 'No se pudo crear el pedido');
            const data = await res.json();
            console.log("Respuesta del servidor order ", data);

            this.showQR(data);
            const cart = JSON.parse(localStorage.getItem('pickup_cart_v1') || '{}');
            delete cart[this.storeId];
            localStorage.setItem('pickup_cart_v1', JSON.stringify(cart));
            window.dispatchEvent(new Event('cart-updated'));
        } catch (err) {
            console.error(err);
            alert('Error al crear pedido: ' + (err.message || ''));
        }
    }

    showQR(orderData) {
        const orderId = orderData.order_id;
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 3);
        const qrPayload = JSON.stringify({ order_id: orderId, expires_at: expiry.toISOString() });

        const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qrPayload);


        const wrap = this.querySelector('#qrWrap');
        wrap.innerHTML = `
      <h3>QR de recogida (válido hasta ${expiry.toLocaleString()})</h3>
      <img src="${qrUrl}" alt="QR del pedido" />
      <p>Entrega tu QR en la tienda para recoger tu pedido.</p>
    `;
    }
}

customElements.define('mfe-checkout', Checkout);

