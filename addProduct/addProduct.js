// AddProduct.js

import { environment } from "./config/environment.js"; 

class AddProduct extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <style>
                /* Importar el CSS de tu modal base */
                @import url(${environment.URL_Index}/style/register.css); 
            </style>
            <div class="modal">
                <form id="form-add-product" class="form-register">
                    <div class="form-header">
                        <h2>Agregar Producto</h2>
                        <button type="button" class="btn close-btn">X</button>
                    </div>

                    <label class="label" for="name">Nombre del Producto</label>
                    <input class="input" name="name" type="text" placeholder="Laptop Gamer" required />
                    
                    <label class="label" for="price">Precio</label>
                    <input class="input" name="price" type="number" step="0.01" min="0" placeholder="1200.00" required />
                    
                    <label class="label" for="stock">Stock (Inventario)</label>
                    <input class="input" name="stock" type="number" min="0" placeholder="50" required value="1" />
                    
                    <label class="label" for="description">Descripción</label>
                    <textarea class="input" name="description" rows="4" placeholder="Breve descripción del producto..." required></textarea>

                    <input type="hidden" name="store_id" value="1" id="store-id-input" />

                    <button class="btn" type="submit"> Guardar Producto </button>
                </form>
            </div>
        `;

        const componentInstance = this;
        const formAddProduct = this.querySelector("#form-add-product");

        formAddProduct.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            // 1. Obtener y convertir datos
            const name = formAddProduct["name"].value;
            const price = formAddProduct["price"].value;
            const description = formAddProduct["description"].value;
            // Nuevos campos requeridos por el backend:
            const stock = formAddProduct["stock"].value;
            const store_id = formAddProduct["store_id"].value; // Obtener el ID de la tienda

            // Crear el objeto de datos
            const productData = {
                name: name,
                description: description,
                // Es crucial enviar price, stock y store_id como números si tu backend lo requiere:
                price: parseFloat(price), 
                stock: parseInt(stock), 
                store_id: parseInt(store_id) 
            };

            // 2. Enviar datos al backend
            try {
                const res = await fetch(`${environment.URL_API}/products`, {
                    method: "POST",
                    headers: { 
                        "Content-type": "application/json" 
                        // Si tu API requiere autenticación (token/cookie), agrégala aquí.
                    },
                    body: JSON.stringify(productData)
                });

                const data = await res.json();

                if (!res.ok) {
                    // Muestra el error específico devuelto por tu controlador (ej: 'Los campos... son obligatorios.')
                    alert(`Error al agregar producto: ${data.error || 'Error desconocido'}`); 
                    return;
                }

                alert(`Producto "${name}" agregado exitosamente! ID: ${data.product_id}`);
                // Disparar un evento si necesitas actualizar la lista de productos
                document.dispatchEvent(new CustomEvent("product-added", { detail: data }));
                closeModal();

            } catch (error) {
                alert("Error de conexión con el servidor.");
                console.error("Fetch Error:", error.message);
            }
        });

        // Lógica de cierre del modal (sin cambios)
        const modal = this.querySelector(".modal");
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        const btnCloseModal = this.querySelector(".close-btn");
        btnCloseModal.addEventListener("click", () => {
            closeModal();
        });

        function closeModal() {
            componentInstance.remove();
        }
    }
}

customElements.define("mfe-add-product", AddProduct);