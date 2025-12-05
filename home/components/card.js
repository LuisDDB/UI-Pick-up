import { environment } from "../config/environment.js";
class Card extends HTMLElement {
    static get observedAttributes() {
        return ['store-id', 'name', 'address', 'phone', 'schedule'];
    }

  
    connectedCallback() {
        const storeId = this.getAttribute('store-id') || '';
        const name = this.getAttribute('name') || 'Nombre no disponible';
        const address = this.getAttribute('address') || 'Dirección no disponible';
        const phone = this.getAttribute('phone') || 'Teléfono no disponible';
        const schedule = this.getAttribute('schedule') || 'Horario no disponible';

        this.innerHTML = `
            <style>
                 @import url(${environment.URL_Home}/style/home.css);
            </style>

            <div class="store-card" data-store-id="${storeId}">
                <div class="store-id-label">ID: ${storeId}</div>
                <h3>${name}</h3>
                <div class="detail-item">
                    <strong>Dirección:</strong> <span>${address}</span>
                </div>
                <div class="detail-item">
                    <strong>Teléfono:</strong> <span>${phone}</span>
                </div>
                <div class="detail-item">
                    <strong>Horario:</strong> <span>${schedule}</span>
                </div>
            </div>
        `;

        this.querySelector('.store-card').addEventListener('click', () => {
            console.log(`Tienda seleccionada: ${name} (ID: ${storeId})`);
            this.dispatchEvent(new CustomEvent('store-selected', { 
                detail: { storeId, name }, 
                bubbles: true, 
                composed: true 
            }));
        });
    }

    

    
}

customElements.define("mfe-card", Card);