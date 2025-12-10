import { environment } from "./config/environment.js";

class OrderClient extends HTMLElement {

    constructor() {
        super();
        this.orders = [];
        this.token = JSON.parse(localStorage.getItem("user")).token;
        this.currentView = "orders";
    }

    connectedCallback() {
        this.render();
        this.bindEvents();
        this.updateView();
    }

    render() {
        this.innerHTML = `
        <style>
            @import url('${environment.URL_Order}/style/orderClient.css');
        </style>

        <div class="dashboard-container">
            <aside class="sidebar">
                <h3>Pick Easy<br><small>Panel de Surtido</small></h3>
                <button class="menu-btn active" id="btn-orders">Pedidos</button>
                <button class="menu-btn" id="btn-history">Historial</button>
            </aside>

            <main class="main-content" id="content-area">
                <div style="padding:2rem; text-align:center;"><h3>Cargando...</h3></div>
            </main>
        </div>
        `;
    }

    async updateView() {
        if (this.currentView === "orders") {
            await this.loadOrders();
        } else {
            await this.loadHistory();
        }
    }

    async fetchOrdersData() {
        const idClient = JSON.parse(localStorage.getItem("user")).id;
        console.log("token: ",this.token);
        try {

            const response = await fetch(`${environment.URL_API}/order/client/${idClient}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.token}`
                }
            });
            const raw = await response.json();
            this.orders = raw.map(o => ({
                id: o.order_id,
                status: o.state,
                store: o.store_id,
                date: o.order_date,
                total: o.total,
                pickupCode: o.pickup_code
            }));
            return true;
        } catch {
            return false;
        }
    }

    async loadOrders() {
        const content = this.querySelector("#content-area");
        content.innerHTML = `<div style="padding:2rem; text-align:center;"><h3>Cargando pedidos...</h3></div>`;

        const ok = await this.fetchOrdersData();
        if (!ok) {
            content.innerHTML = `<div style="color:red; padding:2rem;">Error al conectar con API</div>`;
            return;
        }

        const list = this.orders.filter(o =>
            ['Pendiente', 'Preparando', 'Listo para Recoger'].includes(o.status)
        );

        if (!list.length) {
            content.innerHTML = `<div style="padding:2rem; text-align:center;"><h2>No hay pedidos pendientes</h2></div>`;
            return;
        }

        this.renderGrid(list, content, false);
    }

    async loadHistory() {
        const content = this.querySelector("#content-area");
        content.innerHTML = `<div style="padding:2rem; text-align:center;"><h3>Cargando historial...</h3></div>`;

        await this.fetchOrdersData();

        const list = this.orders.filter(o =>
            ['Recogido', 'Cancelado', 'Entregado'].includes(o.status)
        );

        if (!list.length) {
            content.innerHTML = `<div style="padding:2rem; text-align:center;"><h2>Historial vacío</h2></div>`;
            return;
        }

        this.renderGrid(list, content, true);
    }

    renderGrid(list, container, isHistory) {
        container.innerHTML = `
            <h2>${isHistory ? 'Historial' : 'Pedidos'} (${list.length})</h2>
            <div class="orders-grid">
                ${list.map(order => {
                    let statusClass = 'status-pending';
                    if (order.status === 'Listo para Recoger') statusClass = 'status-ready';
                    if (['Recogido','Cancelado','Entregado'].includes(order.status)) statusClass = 'status-ready';

                    let btnHtml = '';

                    if (!isHistory) {
                        if (order.status === 'Pendiente' || order.status === 'Preparando') {
                            const next = 'Cancelado';
                            const text = 'Cancelar Pedido';
                            const cls = 'btn btn-cancel';
                            btnHtml = `<button class="${cls}" onclick="this.getRootNode().host.updateStatus(${order.id}, '${next}')">${text}</button>`;
                        } else {
                            // Para estados no cancelables (ej: Listo para Recoger)
                            btnHtml = `<span style="color:#64748b; font-size:.8rem;">En Proceso</span>`;
                        }
                    } else {
                        btnHtml = `<span style="color:#64748b; font-size:.8rem;">Finalizado</span>`;
                    }

                    return `
                    <div class="order-card" style="${isHistory ? 'opacity:.8; background:#f8fafc;' : ''}">
                        <div class="order-header">
                            <span class="order-id">#${order.id}</span>
                            <span class="status-badge ${statusClass}">${order.status}</span>
                        </div>
                        <div class="client-info"><h3>${order.store}</h3><small>${order.date}</small></div>
                        <div class="grocery-list">${order.pickupCode ? `<strong>Código: ${order.pickupCode}</strong>` : ''}</div>
                        <div class="order-footer">
                            <span class="total">$${order.total}</span>
                            ${btnHtml}
                        </div>
                    </div>
                `;
                }).join('')}
            </div>
        `;
    }

    async updateStatus(id, newStatus) {
        try {
            const res = await fetch(`http://localhost:3000/api/v1/order/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) this.updateView();
        } catch {}
    }

    bindEvents() {
        const btnOrders = this.querySelector("#btn-orders");
        const btnHistory = this.querySelector("#btn-history");

        const setActive = (btn) => {
            this.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        };

        btnOrders.addEventListener("click", () => {
            this.currentView = "orders";
            setActive(btnOrders);
            this.updateView();
        });

        btnHistory.addEventListener("click", () => {
            this.currentView = "history";
            setActive(btnHistory);
            this.updateView();
        });
    }
}

customElements.define('mfe-order-client', OrderClient);