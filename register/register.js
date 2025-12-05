import "./components/registerCustomer.js"; 
import "./components/registerAdmin.js";

class Register extends HTMLElement {
    connectedCallback() {


        const customer = document.createElement("mfe-register-customer");
        console.log("hola", customer);

        //this.innerHTML= ``;
        const componentInstance = this

        
        componentInstance.appendChild(customer);

        componentInstance.addEventListener("close-model", ()=>{
            componentInstance.remove();
        });

        componentInstance.addEventListener("change-modal",()=>{
            const current = componentInstance.querySelector(
                "mfe-register-customer, mfe-register-admin"
            );

            if (current) current.remove();

            // Crear y agregar el otro
            let newComponent;

            if (current.tagName.toLowerCase() === "mfe-register-customer") {
                newComponent = document.createElement("mfe-register-admin");
            } else {
                newComponent = document.createElement("mfe-register-customer");
            }

            componentInstance.appendChild(newComponent);
        });
    }
    
    
}

customElements.define("mfe-register", Register);
