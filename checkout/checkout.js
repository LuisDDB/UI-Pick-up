import { environment } from "./config/environment.js";

class Checkout extends HTMLElement {
    // ... (connectedCallback e init se quedan igual) ...
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
        // Asegurarse de que user existe
        const userData = localStorage.getItem("user");
        this.clienData = userData ? JSON.parse(userData) : null;
        
        if(!this.clienData) {
            alert("Usuario no identificado");
            // Redirigir a login si es necesario
            return;
        }

        this.renderSummary();
        this.querySelector('#back').addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: { url: `/store/${this.storeId}` } }));
        });
    }

    renderSummary() {
        const cart = JSON.parse(localStorage.getItem('pickup_cart_v1') || '{}');
        const items = cart[this.storeId] ? Object.values(cart[this.storeId]) : [];
        this.items = items;
        
        // CORRECCIÓN DE DECIMALES EN EL CÁLCULO
        const rawTotal = items.reduce((s, i) => s + (i.qty * Number(i.price)), 0);
        this.total = Number(rawTotal.toFixed(2)); // Ahora vale 269.70 exactos

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
                <label>Nombre:</label><input name="customer_name" value="${this.clienData.name || ''}" required />
                <label>Teléfono:</label><input name="customer_phone" required />
                <label>Notas:</label><textarea name="notes"></textarea>
                <button type="submit">Confirmar Pedido</button>
            </form>
            <div id="qrWrap"></div>
        `;

        this.querySelector('#orderForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            // Construimos el payload CORRECTO para el Backend
            const payload = {
                client_id: this.clienData.id,
                store_id: this.storeId,
                total: this.total,
                // ENVIAMOS LOS ITEMS AQUÍ
                items: this.items.map(item => ({
                    qty: item.qty,
                    price: item.price,
                    product_id: item.product_id
                }))
            };
            
            await this.createOrder(payload);
        });
    }

    async createOrder(payload) {
        try {
            const token = this.clienData.token;

            // 1. UNA SOLA LLAMADA AL SERVIDOR
            const res = await fetch(`${environment.URL_API}/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || 'Error en el servidor');
            }

            const responseData = await res.json();
            
            // 2. Si todo salió bien, generamos el QR con el ID que nos devolvió el server
            // Nota: El backend debería devolver el pickup_code también si quieres mostrarlo en texto
            this.showQR(responseData);

            // 3. Limpiar carrito
            const cart = JSON.parse(localStorage.getItem('pickup_cart_v1') || '{}');
            delete cart[this.storeId];
            localStorage.setItem('pickup_cart_v1', JSON.stringify(cart));
            window.dispatchEvent(new Event('cart-updated'));

            // Ocultar formulario para evitar doble envío
            this.querySelector('#orderForm').style.display = 'none';
            this.querySelector('h2').innerText = '¡Pedido Realizado!';

        } catch (err) {
            console.error(err);
            alert('Error al crear pedido: ' + err.message);
        }
    }

    showQR(orderData) {
        const orderId = orderData.order_id;
        const qrPayload = JSON.stringify({ 
            order_id: orderId, 
            action: "pickup" 
        });

        const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qrPayload);

        const wrap = this.querySelector('#qrWrap');
        wrap.innerHTML = `
            <div style="text-align:center; margin-top: 20px;">
                <h3>Orden #${orderId} creada</h3>
                <img src="${qrUrl}" alt="QR del pedido" style="border: 1px solid #ccc; padding: 10px; border-radius: 8px;"/>
                <p>Muestra este código en tienda.</p>
            </div>
        `;
    }
}

customElements.define('mfe-checkout', Checkout);