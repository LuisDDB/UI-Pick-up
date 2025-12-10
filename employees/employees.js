import { environment } from "./config/environment.js";

// Employee Dashboard: Orders, Chat, History
class EmployeeDashboard extends HTMLElement {

    constructor() {
        super();
        this.orders = []; 
        this.currentChatOrderId = null;
        const userStr = localStorage.getItem("user");
        this.user = userStr ? JSON.parse(userStr) : null;
        this.token = this.user ? this.user.token : null;
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
                <div style="padding:2rem; text-align:center;"><h3>⌛ Loading system...</h3></div>
            </main>
        </div>
        `;
    }

    async fetchOrdersData() {
        // Validation: User must have a store_id
        if (!this.user || !this.user.store_id) {
            console.error("User has no store_id assigned");
            alert("Error: No store assigned to this user.");
            return false;
        }

        try {
            // UPDATED: Fetch only orders for this store
            const url = `${environment.URL_API}/api/v1/orders/store/${this.user.store_id}`;
            
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": `Bearer ${this.token}` // Uncomment if Auth is enabled
                }
            });

            const rawData = await response.json();
            
            // Normalize data
            this.orders = rawData.map(o => ({
                id: o.id, // Ensure this matches backend alias
                status: o.status,
                store: o.store,
                date: o.date,
                total: o.total,
                pickupCode: o.pickup_code
            }));
            return true;

        } catch (error) {
            console.error("Fetch error:", error);
            return false;
        }
    }

    // --- VIEW: ACTIVE ORDERS ---
    async loadOrders() {
        const content = this.querySelector("#content-area");
        content.innerHTML = `<div style="padding:2rem; text-align:center;"><h3>⌛ Loading orders...</h3></div>`;
        
        const success = await this.fetchOrdersData();
        if (!success) {
            content.innerHTML = `<div style="color:red; padding:2rem;">API Connection Error</div>`;
            return;
        }

        // Filter: Pending, Preparing, Ready
        const activeOrders = this.orders.filter(o => 
            ['Pendiente', 'Preparando', 'Listo para Recoger'].includes(o.status)
        );

        if (activeOrders.length === 0) {
            content.innerHTML = `<div style="padding:2rem; text-align:center;"><h2>✅ All Clear</h2><p>No pending orders.</p></div>`;
            return;
        }

        this.renderGrid(activeOrders, content, false);
    }

    // --- VIEW: HISTORY ---
    async loadHistory() {
        const content = this.querySelector("#content-area");
        content.innerHTML = `<div style="padding:2rem; text-align:center;"><h3>⌛ Loading history...</h3></div>`;

        await this.fetchOrdersData();

        // Filter: Picked up, Cancelled, Delivered
        const historyOrders = this.orders.filter(o => 
            ['Recogido', 'Cancelado', 'Entregado'].includes(o.status)
        );

        if (historyOrders.length === 0) {
            content.innerHTML = `<div style="padding:2rem; text-align:center;"><h2>📜 Empty History</h2><p>No completed orders yet.</p></div>`;
            return;
        }

        this.renderGrid(historyOrders, content, true);
    }

    // Render Grid Cards
    renderGrid(list, container, isHistory) {
        container.innerHTML = `
            <h2>${isHistory ? 'Delivery History' : 'Active Orders'} (${list.length})</h2>
            <div class="orders-grid">
                ${list.map(order => {
                    let statusClass = 'status-pending';
                    let btnHtml = '';

                    if (order.status === 'Listo para Recoger') statusClass = 'status-ready';
                    if (order.status === 'Recogido') statusClass = 'status-ready';
                    
                    if (!isHistory) {
                        let nextStatus = '';
                        let btnText = '';
                        let btnClass = 'btn';

                        if (order.status === 'Pendiente' || order.status === 'Preparando') {
                            nextStatus = 'Listo para Recoger';
                            btnText = '✅ Mark Ready';
                        } else if (order.status === 'Listo para Recoger') {
                            nextStatus = 'Recogido';
                            btnText = '📦 Deliver';
                            btnClass = 'btn status-ready';
                        }
                        btnHtml = `<button class="${btnClass}" onclick="this.getRootNode().host.updateStatus(${order.id}, '${nextStatus}')">${btnText}</button>`;
                    } else {
                        btnHtml = `<span style="color:#64748b; font-size:0.8rem;">Finished</span>`;
                    }

                    return `
                    <div class="order-card" style="${isHistory ? 'opacity:0.8; background:#f8fafc;' : ''}">
                        <div class="order-header">
                            <span class="order-id">#${order.id}</span>
                            <span class="status-badge ${statusClass}">${order.status}</span>
                        </div>
                        <div class="client-info"><h3>${order.store}</h3><small>${order.date}</small></div>
                        <div class="grocery-list">
                            ${order.pickupCode ? `<strong>Code: ${order.pickupCode}</strong>` : ''}
                        </div>
                        <div class="order-footer">
                            <span class="total">$${order.total}</span>
                            ${btnHtml}
                        </div>
                    </div>
                `}).join('')}
            </div>`;
    }

    // --- ACTION: UPDATE STATUS ---
    async updateStatus(orderId, newStatus) {
        if (!confirm(`Update status to "${newStatus}"?`)) return;
        try {
            const res = await fetch(`${environment.URL_API}/api/v1/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) this.loadOrders(); 
        } catch (err) { alert("Connection Error"); }
    }

    // --- VIEW: CHAT ---
    async loadChatLayout() {
        const content = this.querySelector("#content-area");
        content.innerHTML = `
            <div class="chat-layout">
                <div class="chat-list" id="chat-list-container"><div style="padding:1rem;">Loading chats...</div></div>
                <div class="chat-window" id="chat-window">
                    <div style="padding:2rem; text-align:center; color:#64748b; margin-top: 5rem;"><h3>💬 Messages</h3><p>Select an order.</p></div>
                </div>
            </div>`;
        if (this.orders.length === 0) await this.fetchOrdersData();
        this.renderChatList();
    }

    renderChatList() {
        const list = this.querySelector("#chat-list-container");
        list.innerHTML = this.orders.map(o => `
            <div class="chat-item" id="chat-item-${o.id}">
                <strong>Order #${o.id}</strong><br><small>${o.store}</small>
            </div>`).join('');
        
        this.orders.forEach(o => {
            this.querySelector(`#chat-item-${o.id}`).addEventListener('click', () => this.openChat(o));
        });
    }

    async openChat(order) {
        this.currentChatOrderId = order.id;
        const win = this.querySelector("#chat-window");
        win.innerHTML = `
            <div style="padding:1rem; border-bottom:1px solid #eee; background:white;"><strong>Chat Order #${order.id}</strong></div>
            <div class="messages-area" id="chat-feed"><div style="padding:1rem; text-align:center;">Loading...</div></div>
            <form class="chat-input-area" id="chat-form">
                <input type="text" class="input-chat" id="msg-input" placeholder="Type here..." autocomplete="off">
                <button class="btn" style="border-radius:2rem;">Send</button>
            </form>`;
        
        try {
            const res = await fetch(`${environment.URL_API}/api/v1/orders/${order.id}/messages`);
            const msgs = await res.json();
            const feed = this.querySelector("#chat-feed");
            feed.innerHTML = msgs.length ? '' : '<div style="padding:1rem; text-align:center; color:#ccc;">No messages.</div>';
            msgs.forEach(m => this.appendMsg(m.content, m.sender === 'employee' ? 'me' : 'other'));
            feed.scrollTop = feed.scrollHeight;
            this.setupMsgForm();
        } catch (e) { win.innerHTML = "Error loading chat."; }
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
            await fetch(`${environment.URL_API}/api/v1/messages`, {
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

    // --- NAVIGATION ---
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
        btnHistory.addEventListener("click", () => { 
            this.loadHistory(); 
            setActive(btnHistory); 
        });
    }
}

customElements.define('mfe-employees', EmployeeDashboard);