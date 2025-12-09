

class Orders extends HTMLElement {
    constructor() {
        super();
        this.orders = []; // State array for order data
        this.currentFilter = 'ALL'; // Default filter selection
    }

    connectedCallback() {
        // Render initial UI Structure
        this.innerHTML = `
            <link rel="stylesheet" href="../orders/style/orders.css">
            
            <div class="orders-view">
                <h1>Mis Pedidos</h1>
                
                <div class="filter-bar">
                    <button class="filter-btn active" id="btn-all">Todas</button>
                    <button class="filter-btn" id="btn-pending">Pendientes</button>
                    <button class="filter-btn" id="btn-paid">Pagadas</button>
                </div>

                <div id="loading">
                    Cargando pedidos...
                </div>

                <div id="orders-list" class="orders-list-container"></div>
            </div>
        `;
        
        // Execute data fetching and event binding
        this.fetchOrders();
        this.initEventListeners();
    }

    /**
     * Retrieves order data from the backend API.
     * Updates component state and triggers rendering.
     */
    async fetchOrders() {
        try {
            const response = await fetch('http://localhost:3000/api/v1/orders');
            const data = await response.json();
            
            this.orders = data;
            
            // Hide loading state
            const loadingElement = this.querySelector('#loading');
            if(loadingElement) loadingElement.style.display = 'none';
            
            this.renderList();
        } catch (error) {
            console.error('API Error:', error);
            const loadingElement = this.querySelector('#loading');
            if(loadingElement) {
                loadingElement.innerHTML = "⚠️ Error: Verifica que 'node server.js' esté corriendo.";
            }
        }
    }

    /**
     * Binds click events to filter buttons.
     */
    initEventListeners() {
        const btnAll = this.querySelector('#btn-all');
        const btnPending = this.querySelector('#btn-pending');
        const btnPaid = this.querySelector('#btn-paid');

        btnAll.addEventListener('click', () => this.changeFilter('ALL', btnAll));
        btnPending.addEventListener('click', () => this.changeFilter('PENDING', btnPending));
        btnPaid.addEventListener('click', () => this.changeFilter('COMPLETED', btnPaid));
    }

    /**
     * Updates the active filter and re-renders the view.
     * @param {string} newFilter - The new filter mode ('ALL', 'PENDING', 'COMPLETED').
     * @param {HTMLElement} activeBtn - The button element triggered.
     */
    changeFilter(newFilter, activeBtn) {
        this.currentFilter = newFilter;
        
        // Update button visual state
        this.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
        
        this.renderList();
    }

    /**
     * Renders the order cards based on the current filter and state.
     */
    renderList() {
        const container = this.querySelector('#orders-list');
        
        // Filter Logic: Matches UI filter against Spanish Database values
        const filteredItems = this.orders.filter(order => {
            if (this.currentFilter === 'ALL') return true;
            
            // Group 'Pendiente' and 'Preparando' as Pending
            const isPending = ['Pendiente', 'Preparando'].includes(order.status);
            
            // Group 'Recogido' and 'Listo para Recoger' as Completed/Paid
            const isCompleted = ['Recogido', 'Listo para Recoger'].includes(order.status);

            if (this.currentFilter === 'PENDING') return isPending;
            if (this.currentFilter === 'COMPLETED') return isCompleted;
            return false;
        });

        // Empty state handling
        if (filteredItems.length === 0) {
            container.innerHTML = `<h3 style="text-align:center; color:rgba(255,255,255,0.7); margin-top:2rem;">No hay pedidos en esta sección</h3>`;
            return;
        }

        // SVG Icons definition
        const iconCheck = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
        const iconClock = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;

        // Generate HTML Cards
        container.innerHTML = filteredItems.map(order => {
            // Determine styling class based on DB status
            const isCompletedGroup = ['Recogido', 'Listo para Recoger'].includes(order.status);
            
            const cssClass = isCompletedGroup ? 'completed' : 'pending';
            const icon = isCompletedGroup ? iconCheck : iconClock;

            return `
                <div class="order-card ${cssClass}">
                    <div class="order-content">
                        <h3 class="order-title">Pedido #${order.id}</h3>
                        <div class="order-store">${order.store}</div>
                        <div style="color:rgba(255,255,255,0.6); font-size:0.75rem; margin-top:4px;">
                            ${order.date} ${order.pickup_code ? `• Código: <strong>${order.pickup_code}</strong>` : ''}
                        </div>
                        <div class="order-price">$${order.total}</div>
                    </div>
                    
                    <div class="status-section">
                        <div class="icon-box">
                            ${icon}
                        </div>
                        <span class="status-label ${cssClass}">${order.status}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Define Custom Element
customElements.define('mfe-orders', Orders);