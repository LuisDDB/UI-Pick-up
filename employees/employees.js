import { environment } from "./config/environment.js";

class EmployeeDashboard extends HTMLElement {

    constructor() {
        super();
        this.currentTab = 'orders';
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
        this.loadOrdersView(); 
    }

    render() {
        this.innerHTML = `
        <style>
            @import url('../employees/style/employees.css');
        </style>

        <div class="dashboard-container">
            <aside class="sidebar">
                <h3>Pick Easy <br><small style="font-size:0.8rem; color:#64748b; font-weight:400;">Panel de Surtido</small></h3>
                <button class="menu-btn active" id="btn-orders">Pedidos por Surtir</button>
                <button class="menu-btn" id="btn-chat">Mensajes Clientes</button>
                <button class="menu-btn" id="btn-history">Historial Entregas</button>
            </aside>

            <main class="main-content" id="content-area">
                </main>
        </div>
        `;
    }

    // orders view
    loadOrdersView() {
        const content = this.querySelector("#content-area");
        
        // mock data
        const mockOrders = [
            { 
                id: 2045, 
                client: "Mariana Moreno", 
                time: "Recoge: 4:30 PM",
                items: "• 2L Leche Lala Entera<br>• 1kg Huevo San Juan<br>• 1kg Plátano Chiapas<br>• 1 Pan Bimbo Blanco", 
                total: "$185.50", 
                status: "Pendiente" 
            },
            { 
                id: 2046, 
                client: "Rafa Polinesio", 
                time: "Recoge: 5:00 PM",
                items: "• 1 Six Pack Cerveza Modelo<br>• 2 Bolsas Sabritas Sal<br>• 1 Salsa Valentina", 
                total: "$240.00", 
                status: "Pendiente" 
            },
            { 
                id: 2042, 
                client: "Ana Karen", 
                time: "Listo para entrega",
                items: "• Jabón Ariel 5kg<br>• Suavitel 3L<br>• Cloro Cloralex", 
                total: "$310.00", 
                status: "Listo" 
            }
        ];

        content.innerHTML = `
            <h2>Pedidos en Curso</h2>
            <div class="orders-grid">
                ${mockOrders.map(order => `
                    <div class="order-card">
                        <div class="order-header">
                            <span class="order-id">#${order.id}</span>
                            <span class="status-badge ${order.status === 'Listo' ? 'status-ready' : 'status-pending'}">
                                ${order.status}
                            </span>
                        </div>
                        
                        <div class="client-info">
                            <h3>${order.client}</h3>
                            <small>${order.time}</small>
                        </div>

                        <div class="grocery-list">
                            ${order.items}
                        </div>

                        <div class="order-footer">
                            <span class="total">${order.total}</span>
                            <button class="btn">
                                ${order.status === 'Pendiente' ? 'Surtido Completo' : 'Entregar Pedido'}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // chat view
    loadChatView() {
        const content = this.querySelector("#content-area");
        content.innerHTML = `
            <div class="chat-layout">
                <div class="chat-list">
                    <div class="chat-item" style="background:#f1f5f9; border-left: 4px solid var(--primary-color);">
                        <strong>Martha Sánchez</strong><br>
                        <small style="color:#64748b;">¿Puedo agregar algo más?</small>
                    </div>
                    <div class="chat-item">
                        <strong>Roberto Díaz</strong><br>
                        <small style="color:#64748b;">Voy retrasado 10 min...</small>
                    </div>
                </div>

                <div class="chat-window">
                    <div style="padding: 1rem; border-bottom: 1px solid #e2e8f0; background: white;">
                        <strong>Chat con: Martha Sánchez</strong>
                        <div style="font-size:0.8rem; color:green;">● En línea</div>
                    </div>
                    
                    <div class="messages-area">
                        <div class="msg msg-client">Hola, ¿aún alcanzo a pedir unas galletas?</div>
                        <div class="msg msg-emp">Hola Martha, claro. ¿Cuáles necesitas?</div>
                        <div class="msg msg-client">Unas Chokis por favor.</div>
                        <div class="msg msg-emp">¡Listo! Agregadas a tu cuenta.</div>
                    </div>

                    <form class="chat-input-area">
                        <input type="text" class="input-chat" placeholder="Escribe un mensaje...">
                        <button class="btn" style="margin:0; border-radius:2rem;">Enviar</button>
                    </form>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        const btnOrders = this.querySelector("#btn-orders");
        const btnChat = this.querySelector("#btn-chat");

        btnOrders.addEventListener("click", () => {
            this.updateActiveBtn(btnOrders);
            this.loadOrdersView();
        });

        btnChat.addEventListener("click", () => {
            this.updateActiveBtn(btnChat);
            this.loadChatView();
        });
    }

    updateActiveBtn(activeBtn) {
        this.querySelectorAll(".menu-btn").forEach(btn => btn.classList.remove("active"));
        activeBtn.classList.add("active");
    }
}

customElements.define('mfe-employees', EmployeeDashboard);