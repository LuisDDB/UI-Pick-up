// FILE: employees/employees.js
import { environment } from "./config/environment.js";

/**
 * Employee Dashboard Component.
 * Features: Order management, Status Updates, Chat, and HISTORY.
 */
class EmployeeDashboard extends HTMLElement {

    constructor() {
        super();
        this.orders = []; 
        this.currentChatOrderId = null;
        this.token = JSON.parse(localStorage.getItem("user")).token;
    }

    connectedCallback() {
        this.render();
        this.bindEvents();
        this.loadOrders(); 
    }

    render() {
        this.innerHTML = `
        <style>
            @import url('${environment.URL_Employees}/style/employees.css');
        </style>

        <div class="dashboard-container">
            <aside class="sidebar">
                <h3>Pick Easy <br><small>Panel de Surtido</small></h3>
                <button class="menu-btn active" id="btn-orders">Pedidos por Surtir</button>
                <button class="menu-btn" id="btn-chat">Mensajes Clientes</button>
                <button class="menu-btn" id="btn-history">Historial Entregas</button>
            </aside>

            <main class="main-content" id="content-area">
                <div style="padding:2rem; text-align:center;"><h3>⌛ Cargando sistema...</h3></div>
            </main>
        </div>
        `;
    }

    async fetchOrdersData() {
            console.log(this.token);

        try {
            const response = await fetch('http://localhost:3000/api/v1/order',
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bear ${this.token}`
                    }
                }
            );
            const rawData = await response.json();
            
            // Guardamos los datos normalizados
            this.orders = rawData.map(o => ({
                id: o.order_id,
                status: o.state,
                store: o.store_id,
                date: o.order_date,
                total: o.total,
                pickupCode: o.pickup_code
            }));
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // --- 1. VISTA: PEDIDOS ACTIVOS ---
    async loadOrders() {
        const content = this.querySelector("#content-area");
        content.innerHTML = `<div style="padding:2rem; text-align:center;"><h3>⌛ Cargando pedidos...</h3></div>`;
        
        const success = await this.fetchOrdersData();
        if (!success) {
            content.innerHTML = `<div style="color:red; padding:2rem;">Error de conexión con API</div>`;
            return;
        }

        // Filtramos solo los activos (Pendiente, Preparando, Listo)
        const activeOrders = this.orders.filter(o => 
            ['Pendiente', 'Preparando', 'Listo para Recoger'].includes(o.status)
        );

        if (activeOrders.length === 0) {
            content.innerHTML = `<div style="padding:2rem; text-align:center;"><h2>✅ Todo al día</h2><p>No hay pedidos pendientes por surtir.</p></div>`;
            return;
        }

        this.renderGrid(activeOrders, content, false);
    }

    // --- 2. VISTA: HISTORIAL (NUEVA) ---
    async loadHistory() {
        const content = this.querySelector("#content-area");
        content.innerHTML = `<div style="padding:2rem; text-align:center;"><h3>⌛ Cargando historial...</h3></div>`;

        // Refrescamos datos por si hubo cambios recientes
        await this.fetchOrdersData();

        // Filtramos solo los TERMINADOS (Recogido, Cancelado)
        const historyOrders = this.orders.filter(o => 
            ['Recogido', 'Cancelado', 'Entregado'].includes(o.status)
        );

        if (historyOrders.length === 0) {
            content.innerHTML = `<div style="padding:2rem; text-align:center;"><h2>📜 Historial vacío</h2><p>Aún no se han completado entregas.</p></div>`;
            return;
        }

        // Usamos la misma función de renderizado pero con modo "historial"
        this.renderGrid(historyOrders, content, true);
    }

    // Función reutilizable para pintar las tarjetas
    renderGrid(list, container, isHistory) {
        container.innerHTML = `
            <h2>${isHistory ? 'Historial de Entregas' : 'Pedidos en Curso'} (${list.length})</h2>
            <div class="orders-grid">
                ${list.map(order => {
                    // Lógica visual
                    let statusClass = 'status-pending';
                    let btnHtml = '';

                    if (order.status === 'Listo para Recoger') statusClass = 'status-ready';
                    if (order.status === 'Recogido') statusClass = 'status-ready'; // Usamos verde para finalizados también
                    
                    // Botones: Solo mostramos acciones si NO es historial
                    if (!isHistory) {
                        let nextStatus = '';
                        let btnText = '';
                        let btnClass = 'btn';

                        if (order.status === 'Pendiente' || order.status === 'Preparando') {
                            nextStatus = 'Listo para Recoger';
                            btnText = '✅ Marcar Listo';
                        } else if (order.status === 'Listo para Recoger') {
                            nextStatus = 'Recogido';
                            btnText = '📦 Entregar';
                            btnClass = 'btn status-ready';
                        }
                        btnHtml = `<button class="${btnClass}" onclick="this.getRootNode().host.updateStatus(${order.id}, '${nextStatus}')">${btnText}</button>`;
                    } else {
                        // En historial solo mostramos fecha o un texto estático
                        btnHtml = `<span style="color:#64748b; font-size:0.8rem;">Finalizado</span>`;
                    }

                    return `
                    <div class="order-card" style="${isHistory ? 'opacity:0.8; background:#f8fafc;' : ''}">
                        <div class="order-header">
                            <span class="order-id">#${order.id}</span>
                            <span class="status-badge ${statusClass}">${order.status}</span>
                        </div>
                        <div class="client-info"><h3>${order.store}</h3><small>${order.date}</small></div>
                        <div class="grocery-list">
                            ${order.pickupCode ? `<strong>Código: ${order.pickupCode}</strong>` : ''}
                        </div>
                        <div class="order-footer">
                            <span class="total">$${order.total}</span>
                            ${btnHtml}
                        </div>
                    </div>
                `}).join('')}
            </div>`;
    }

    // --- ACTUALIZAR ESTADO ---
    async updateStatus(orderId, newStatus) {
        if (!confirm(`¿Cambiar estado a "${newStatus}"?`)) return;
        try {
            const res = await fetch(`http://localhost:3000/api/v1/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) this.loadOrders(); // Recargar vista activa
        } catch (err) { alert("Error de conexión"); }
    }

    // --- 3. VISTA: CHAT ---
    async loadChatLayout() {
        const content = this.querySelector("#content-area");
        content.innerHTML = `
            <div class="chat-layout">
                <div class="chat-list" id="chat-list-container"><div style="padding:1rem;">Cargando chats...</div></div>
                <div class="chat-window" id="chat-window">
                    <div style="padding:2rem; text-align:center; color:#64748b; margin-top: 5rem;"><h3>💬 Mensajes</h3><p>Selecciona un pedido.</p></div>
                </div>
            </div>`;
        if (this.orders.length === 0) await this.fetchOrdersData();
        this.renderChatList();
    }

    renderChatList() {
        const list = this.querySelector("#chat-list-container");
        // Mostramos todos los pedidos en el chat para poder consultar dudas de cualquiera
        list.innerHTML = this.orders.map(o => `
            <div class="chat-item" id="chat-item-${o.id}">
                <strong>Pedido #${o.id}</strong><br><small>${o.store}</small>
            </div>`).join('');
        
        this.orders.forEach(o => {
            this.querySelector(`#chat-item-${o.id}`).addEventListener('click', () => this.openChat(o));
        });
    }

    async openChat(order) {
        this.currentChatOrderId = order.id;
        const win = this.querySelector("#chat-window");
        win.innerHTML = `
            <div style="padding:1rem; border-bottom:1px solid #eee; background:white;"><strong>Chat Pedido #${order.id}</strong></div>
            <div class="messages-area" id="chat-feed"><div style="padding:1rem; text-align:center;">Cargando...</div></div>
            <form class="chat-input-area" id="chat-form">
                <input type="text" class="input-chat" id="msg-input" placeholder="Escribe..." autocomplete="off">
                <button class="btn" style="border-radius:2rem;">Enviar</button>
            </form>`;
        
        try {
            const res = await fetch(`http://localhost:3000/api/v1/orders/${order.id}/messages`);
            const msgs = await res.json();
            const feed = this.querySelector("#chat-feed");
            feed.innerHTML = msgs.length ? '' : '<div style="padding:1rem; text-align:center; color:#ccc;">Sin mensajes.</div>';
            msgs.forEach(m => this.appendMsg(m.content, m.sender === 'employee' ? 'me' : 'other'));
            feed.scrollTop = feed.scrollHeight;
            this.setupMsgForm();
        } catch (e) { win.innerHTML = "Error cargando chat."; }
    }

    setupMsgForm() {
        const form = this.querySelector("#chat-form");
        const input = this.querySelector("#msg-input");
        form.addEventListener("submit", async e => {
            e.preventDefault();
            const text = input.value.trim();
            if(!text) return;
            this.appendMsg(text, 'me');
            input.value = "";
            await fetch('http://localhost:3000/api/v1/messages', {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ orderId: this.currentChatOrderId, senderRole: 'employee', content: text })
            });
        });
    }

    appendMsg(text, type) {
        const d = document.createElement("div");
        d.className = `msg ${type === 'me' ? 'msg-emp' : 'msg-client'}`;
        d.textContent = text;
        this.querySelector("#chat-feed").appendChild(d);
    }

    // --- NAVEGACIÓN ---
    bindEvents() {
        const btnOrders = this.querySelector("#btn-orders");
        const btnChat = this.querySelector("#btn-chat");
        const btnHistory = this.querySelector("#btn-history");

        const setActive = (btn) => {
            this.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        };

        btnOrders.addEventListener("click", () => { this.loadOrders(); setActive(btnOrders); });
        btnChat.addEventListener("click", () => { this.loadChatLayout(); setActive(btnChat); });
        
        // ✅ AHORA SÍ ESTÁ CONECTADO
        btnHistory.addEventListener("click", () => { 
            this.loadHistory(); 
            setActive(btnHistory); 
        });
    }
}

customElements.define('mfe-employees', EmployeeDashboard);