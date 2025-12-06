// StorePage.js (MODIFICADO)

import { environment } from "./config/environment.js"; 

const DEFAULT_STORE_ID = 1; 

class StorePage extends HTMLElement {
    constructor() {
        super();
        this.storeId = this.getAttribute('store-id') || DEFAULT_STORE_ID;
        this.storeData = null;
    }

    connectedCallback() {
        // 1. Renderizar la estructura inicial que incluye el botón.
        this.renderInitialLoading(); 
        
        // 2. Adjuntar los listeners DE INMEDIATO.
        this.attachEventListeners();

        // 3. Iniciar la carga de datos.
        this.fetchStoreData(this.storeId);
        
        // 4. Listener para recargar después de editar el modal
        document.addEventListener("store-updated", this.handleStoreUpdate);
    }
    
    disconnectedCallback() {
        // Limpiar el listener al remover el componente
        document.removeEventListener("store-updated", this.handleStoreUpdate);
    }

    handleStoreUpdate = (e) => {
        if (e.detail.storeId == this.storeId) {
            this.fetchStoreData(this.storeId); 
        }
    };
    
    // --- NUEVO MÉTODO ---
    attachEventListeners() {
        // Adjuntar el listener del botón de edición aquí, ANTES de que los datos carguen.
        const editButton = this.querySelector('#edit-store-btn');
        if (editButton) {
            editButton.addEventListener('click', () => {
                this.openEditModal(); 
            });
        }
    }

    openEditModal() {
        const modal = document.createElement('mfe-edit-store-modal');
        
        // **IMPORTANTE:** Si storeData es nulo (la carga falló), 
        // pasamos un objeto vacío con el ID, o el objeto completo si existe.
        const dataToPass = this.storeData || { 
            store_id: this.storeId, 
            name: "Nueva Tienda", 
            address: "", 
            phone: "", 
            schedule: "" 
        };
        
        modal.storeData = dataToPass; 
        
        document.body.appendChild(modal);
    }

    // ----------------------------------------------------------------------
    // 1. MODIFICACIÓN: Incluir el HTML COMPLETO, incluyendo el botón de edición
    // ----------------------------------------------------------------------
    renderInitialLoading() {
        this.innerHTML = `
            <div class="store-page-wrapper p-4 max-w-7xl mx-auto">
                <div class="store-card bg-white p-8 md:p-10 rounded-xl shadow-xl mt-8">
                    
                    <h1 class="text-3xl md:text-4xl font-bold text-primary-color border-b-4 border-btn-color pb-2 mb-6">
                        Cargando Tienda...
                    </h1>

                    <div class="store-details grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div class="loading-state text-xl font-semibold text-primary-color col-span-full">
                            Obteniendo datos de la API...
                        </div>
                    </div>

                    <hr class="my-8 border-gray-300">

                    <div class="products-section">
                        <h2 class="text-2xl font-semibold text-btn-selected mb-4 border-l-4 border-btn-color pl-3">
                            Productos Disponibles
                        </h2>
                        <p class="text-gray-500 italic">Cargando lista de productos...</p>
                    </div>

                    <div class="store-actions mt-6 text-right">
                        <button id="edit-store-btn" class="bg-btn-color hover:bg-btn-selected text-white py-2 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                            Editar Información ✏️
                        </button>
                    </div>

                </div>
            </div>
        `;
    }

    // ----------------------------------------------------------------------
    // 2. MODIFICACIÓN: renderStore SOLO ACTUALIZA LOS CAMPOS DE DATOS
    // ----------------------------------------------------------------------
    renderStore() {
        if (!this.storeData) {
            this.renderError("No se pudieron cargar los datos de la tienda.");
            return;
        }

        const { store_id, name, address, phone, schedule } = this.storeData;
        
        const card = this.querySelector('.store-card');
        if (!card) return; // Asegurar que el contenedor exista

        // Actualizar el título principal
        card.querySelector('h1').textContent = name;
        
        // Actualizar los detalles
        card.querySelector('.store-details').innerHTML = `
            <div class="detail-item text-lg">
                <span class="detail-label block font-semibold text-primary-color mb-1">ID de Tienda:</span>
                <span class="detail-value text-gray-700">${store_id}</span>
            </div>
            <div class="detail-item text-lg">
                <span class="detail-label block font-semibold text-primary-color mb-1">Dirección:</span>
                <span class="detail-value text-gray-700">${address}</span>
            </div>
            <div class="detail-item text-lg">
                <span class="detail-label block font-semibold text-primary-color mb-1">Teléfono:</span>
                <span class="detail-value text-gray-700">${phone}</span>
            </div>
            <div class="detail-item text-lg">
                <span class="detail-label block font-semibold text-primary-color mb-1">Horario:</span>
                <span class="detail-value text-gray-700">${schedule}</span>
            </div>
        `;

        // Opcional: Actualizar el título de productos después de cargar la tienda
        card.querySelector('.products-section p').textContent = "Lista de productos pendiente de integración...";
    }
    
    // El fetchStoreData solo tiene que manejar el guardado de this.storeData y la llamada a renderStore
    async fetchStoreData(id) {
        try {
            const res = await fetch(`${environment.URL_API}/stores/${id}`);
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Error HTTP: ${res.status}`);
            }

            this.storeData = await res.json();
            this.renderStore();

        } catch (error) {
            console.error('Error al obtener datos de la tienda:', error);
            // Si hay un error, el botón ya está visible, solo mostramos el error de datos.
            this.renderError(error.message);
        }
    }

    renderError(message) {
         this.querySelector('.store-details').innerHTML = `
            <div class="error-state text-center p-6 bg-red-100 border border-red-500 rounded-lg text-red-700 col-span-full">
                <h2 class="text-xl font-bold mb-2">Error de datos</h2>
                <p class="text-lg">No se pudieron cargar los datos de la tienda. Puedes intentar editarlos: ${message}</p>
            </div>
        `;
    }
}

customElements.define("mfe-store-page", StorePage);