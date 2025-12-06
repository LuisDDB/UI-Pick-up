// EditStoreModal.js

import { environment } from "./config/environment.js";

class EditStoreModal extends HTMLElement {
    
    // El constructor es donde capturamos los datos que se pasaron desde StorePage.js
    constructor() {
        super();
        this.storeData = null; // Se llenará externamente
    }

    connectedCallback() {
        // Obtenemos los datos pasados desde el componente padre
        this.storeData = this.storeData || this.getAttribute('storeData') ? JSON.parse(this.getAttribute('storeData')) : null;
        
        if (!this.storeData) {
            console.error("Error: No se proporcionaron datos de la tienda para editar.");
            this.innerHTML = `<div class="modal flex justify-center items-center bg-bg-transparent">
                                 <p class="text-red-500 bg-white p-4 rounded-lg">Error al cargar datos de edición.</p>
                              </div>`;
            return;
        }

        this.render();
        this.attachEventListeners();
    }

    render() {
        const { name, address, phone, schedule, store_id } = this.storeData;

        this.innerHTML = `
            <div class="modal fixed top-0 left-0 w-full h-full bg-bg-transparent flex justify-center items-center z-50">
                
                <form id="form-edit-store" class="form-register w-full max-w-md mx-4 bg-gray p-8 rounded-xl shadow-2xl flex flex-col gap-4" style="box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);">
                    
                    <div class="form-header flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold text-primary-color">Editar Tienda (${store_id})</h2>
                        <button type="button" class="close-btn text-black text-xl font-bold p-2 bg-transparent border-none cursor-pointer" id="close-modal-btn">X</button>
                    </div>

                    <label class="label text-primary-color font-semibold" for="name">Nombre</label>
                    <input class="input p-3 border rounded-lg focus:border-btn-color focus:ring-2 focus:ring-btn-color transition" name="name" type="text" value="${name}" required />
                    
                    <label class="label text-primary-color font-semibold" for="address">Dirección</label>
                    <input class="input p-3 border rounded-lg focus:border-btn-color focus:ring-2 focus:ring-btn-color transition" name="address" type="text" value="${address}" required />
                    
                    <label class="label text-primary-color font-semibold" for="phone">Teléfono</label>
                    <input class="input p-3 border rounded-lg focus:border-btn-color focus:ring-2 focus:ring-btn-color transition" name="phone" type="tel" value="${phone}" required />
                    
                    <label class="label text-primary-color font-semibold" for="schedule">Horario</label>
                    <input class="input p-3 border rounded-lg focus:border-btn-color focus:ring-2 focus:ring-btn-color transition" name="schedule" type="text" value="${schedule}" required />

                    <button class="btn bg-btn-color hover:bg-btn-selected text-white py-2 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:translate-y-[-2px] shadow-md mt-4" type="submit"> Guardar Cambios </button>
                </form>
            </div>
        `;
    }

    attachEventListeners() {
        const modal = this.querySelector(".modal");
        const form = this.querySelector("#form-edit-store");
        const closeButton = this.querySelector("#close-modal-btn");

        const closeModal = () => this.remove();

        // Cierre al hacer clic fuera
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Cierre con botón 'X'
        closeButton.addEventListener("click", closeModal);

        // Manejo del envío del formulario
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            await this.handleFormSubmit(form, closeModal);
        });
    }

    async handleFormSubmit(form, closeModal) {
        const formData = {
            name: form.name.value,
            address: form.address.value,
            phone: form.phone.value,
            schedule: form.schedule.value
        };

        const storeId = this.storeData.store_id;

        try {
            // Llama al endpoint de actualización de tu backend (StoreController.update)
            const res = await fetch(`${environment.URL_API}/stores/${storeId}`, {
                method: "PUT", // o PATCH, según lo que uses en tu controlador
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                alert(`Error al actualizar la tienda: ${data.error || 'Error desconocido'}`); 
                return;
            }

            alert(`Tienda ${formData.name} actualizada exitosamente.`);
            
            // 🚨 Disparar evento para que StorePage.js recargue los datos
            document.dispatchEvent(new CustomEvent("store-updated", {
                detail: { storeId: storeId, newData: data }
            }));
            
            closeModal();

        } catch (error) {
            alert("Error de conexión al servidor para actualizar la tienda.");
            console.error("Fetch Error:", error.message);
        }
    }
}

customElements.define("mfe-edit-store-modal", EditStoreModal);