import { environment } from "../config/environment.js";

console.log("CARGANDO registerCustomer.js - Versión Corregida");

class RegisterCustomer extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <style>
            @import url(${environment.URL_Register}/style/register.css);
        </style>
        <div class="modal">
            <form id="form-register" class="form-register">
            <div class="form-header">
                <h2>Registrarse</h2>
                <button type="button" class="btn close-btn">X</button>
            </div>

            <label class="label" for="name">Nombre completo</label>
            <input class="input" name="name" type="text" placeholder="Luis Domínguez" required />

            <label class="label" for="phone">Teléfono</label>
            <input class="input" name="phone" type="tel" placeholder="622 123 4567" required />

            <label class="label" for="address">Dirección</label>
            <input class="input" name="address" type="text" placeholder="Av. Principal #123" required />

            <label class="label" for="email">Email</label>
            <input class="input" name="email" type="email" placeholder="ejemplo@gmail.com" required />

            <label class="label" for="password">Contraseña</label>
            <input class="input" name="password" type="password" placeholder="contraseña" required/>

            <button class="btn" type="submit">Registrarse</button>

            <button type="button" id="toLogin" class="btn-enlace">
                ¿Ya tienes una cuenta? <span>Inicia sesión aquí</span>
            </button>

            <button type="button" id="toRegisterAdmin" class="btn-enlace">
                ¿Quieres integrar tu tienda? <span>Entra aquí</span>
            </button>
            </form>
        </div>
        `;

        const componentInstance = this;
        const modal = this.querySelector(".modal");
        const formRegister = this.querySelector("#form-register");
        const btnToLogin = this.querySelector("#toLogin");
        const btnCloseModal = this.querySelector(".close-btn");
        const btnToRegisterAdmin = componentInstance.querySelector("#toRegisterAdmin");

        // Manejo de cambio a registro de admin
        if (btnToRegisterAdmin) {
            btnToRegisterAdmin.addEventListener("click", () => {
                componentInstance.dispatchEvent(
                    new CustomEvent("change-modal", { bubbles: true, composed: true })
                );
            });
        }

        // Cierre de modal al dar click afuera
        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) closeModal();
            });
        }

        // Botón cerrar (X)
        if (btnCloseModal) {
            btnCloseModal.addEventListener("click", closeModal);
        }

        // Ir al login
        if (btnToLogin) {
            btnToLogin.addEventListener("click", openLoginModal);
        }

        // ENVÍO DEL FORMULARIO
        if (formRegister) {
            formRegister.addEventListener("submit", async (e) => {
                e.preventDefault();
                
                // Recopilamos los 5 datos exactos
                const formData = {
                    name: formRegister["name"].value,
                    phone: formRegister["phone"].value,
                    address: formRegister["address"].value,
                    email: formRegister["email"].value,
                    password: formRegister["password"].value
                };

                console.log("Enviando datos:", formData);

                try {
                    const res = await fetch(`${environment.URL_API}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formData)
                    });

                    const data = await res.json();
                    
                    if (!res.ok) {
                        alert(data.message || data.error || "Error al registrar usuario");
                        return;
                    }

                    console.log("Registro exitoso:", data);
                    alert("¡Cuenta creada correctamente! Por favor inicia sesión.");
                    openLoginModal();
                    
                } catch (err) {
                    console.error("Error de red o servidor:", err);
                    alert("No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
                }
            });
        }

        function openLoginModal() {
            componentInstance.dispatchEvent(new CustomEvent("open-login", {
                bubbles: true,
                composed: true
            }));
            closeModal();
        }

        function closeModal() {
            componentInstance.dispatchEvent(
                new CustomEvent("close-model", {
                    bubbles: true,
                    composed: true
                })
            );
        }
    }
}

if (!customElements.get("mfe-register-customer")) {
    customElements.define("mfe-register-customer", RegisterCustomer);
} else {
    console.warn("mfe-register-customer already defined");
}