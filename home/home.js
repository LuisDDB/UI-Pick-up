import "./components/card.js";
import { environment } from "./config/environment.js";

class Home extends HTMLElement{
    connectedCallback(){
        this.innerHTML= `
        <style>
            @import url(${environment.URL_Home}/style/home.css);
        </style>
        
        <h1>Eliga la tienda que más le guste</h1>

        <div id="products" class="container">
            </div>
        `;

        // Llamar a getStores y procesar los datos
        this.loadStores();
    }

    async getStores(){
        try{
            const res = await fetch(`${environment.URL_API}/store`,{
                method: "GET",
                credentials: "include",
                headers:{"Content-Type": "application/json"},
            });
            const data = await res.json();
            if(!res.ok){
                // Usar throw new Error para manejar mejor los errores
                throw new Error(data.message || "Fallo al cargar las tiendas");
            }
            return data;
        }catch(err){
            console.error("Error en getStores:", err);
            // Podrías mostrar un mensaje de error en la UI aquí
            return []; // Devolver un array vacío para evitar que el programa se detenga
        }
    }

    async loadStores() {
        const stores = await this.getStores();
        const container = this.querySelector('#products');

        if (stores && stores.length > 0) {
            stores.forEach(store => {
                // Crear una nueva instancia de tu Web Component
                const card = document.createElement('mfe-card');
                
                // Establecer los atributos del Web Component con los datos de la tienda
                // Nota: Los nombres de los atributos HTML son minúsculas separadas por guiones
                card.setAttribute('store-id', store.store_id);
                card.setAttribute('name', store.name);
                card.setAttribute('address', store.address);
                card.setAttribute('phone', store.phone);
                card.setAttribute('schedule', store.schedule);
                
                // Añadir la tarjeta al contenedor
                container.appendChild(card);
            });
        } else if (container) {
            container.innerHTML = '<p>No se encontraron tiendas disponibles.</p>';
        }
    }
}

customElements.define("mfe-home", Home);