import { environment } from "../config/environment.js";

class RegisterAdmin extends HTMLElement {

    connectedCallback() {
        this.innerHTML = `
        <style>
            @import url(${environment.URL_Register}/style/register.css);
        </style>

        <div id="modal" class="modal">
            <form id="registerAdminForm" class="form-admin form-register">

                <div class="form-header">
                    <h2>Crear cuenta </h2>
                    <button type="button" class="close-btn">X</button>
                </div>

                <label class="label" for="adminName">Nombre completo</label>
                <input class="input" name="adminName" type="text" placeholder="Luis Domínguez" required />
            
                <label class="label" for="email">Correo del administrador</label>
                <input class="input" name="email" type="email" placeholder="ejemplo@gmail.com" required />

                <label class="label" for="password">Contraseña</label>
                <input class="input" name="password" type="password" placeholder="Contraseña" required />

                <h3 style="margin-top: 15px;">Información de la tienda</h3>

                <label class="label" for="storeName">Nombre de la tienda</label>
                <input class="input" name="storeName" type="text" placeholder="Nombre de la tienda" required />

                <label class="label" for="address">Dirección</label>
                <input class="input" name="address" type="text" placeholder="Dirección completa" required />

                <label class="label" for="phone">Teléfono</label>
                <input class="input" name="phone" type="tel" placeholder="Ej: 555-123-4567" required />

                <label class="label" for="schedule">Horario</label>
                <input class="input" name="schedule" type="text" placeholder="Ej: L–V 9:00–18:00" required />

                <button class="btn" type="submit">Crear cuenta</button>

                <button type="button" id="toLogin" class="btn-enlace">
                    ¿Ya tienes cuenta? <span>Inicia sesión</span>
                </button>

                <button type="button" id="toRegisterAdmin" class="btn-enlace">
                    ¿Quieres integrar tu tienda? <span>Entra aquí</span>
                </button>

            </form>
        </div>
        `;

        const componentInstance = this;

        // Se usa "#registerAdminForm" que es el ID del formulario en el HTML.
        const formRegister = this.querySelector("#registerAdminForm"); 
        const modal = this.querySelector(".modal");
        const btnToLogin = this.querySelector("#toLogin");
        const btnCloseModal = this.querySelector(".close-btn");

        const btnToRegisterAdmin = componentInstance.querySelector("#toRegisterAdmin");

        if (btnToRegisterAdmin) {
            btnToRegisterAdmin.addEventListener("click", () => {
                componentInstance.dispatchEvent(
                    new CustomEvent("change-modal", {
                        bubbles: true,
                        composed: true,
                    })
                );
            });
        }


        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) closeModal();
            });
        }

        if (btnCloseModal) {
            btnCloseModal.addEventListener("click", closeModal);
        }

        if (btnToLogin) {
            btnToLogin.addEventListener("click", openLoginModal);
        }
        
        // Se adjunta el listener al formulario con ID "registerAdminForm"
        if (formRegister) {
            formRegister.addEventListener("submit", async (e) => {
                e.preventDefault();
                
                const adminName = formRegister["adminName"].value;
                const email = formRegister["email"].value;
                const password = formRegister["password"].value;
                
                const storeName = formRegister["storeName"].value; 
                const address = formRegister["address"].value;
                const phone = formRegister["phone"].value;
                const schedule = formRegister["schedule"].value;

                try {
                    const storeRes = await fetch(`${environment.URL_API}/store/`, { 
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                            name: storeName, 
                            address, 
                            phone, 
                            schedule 
                        })
                    });

                    const storeData = await storeRes.json();
                    if (!storeRes.ok) {
                        alert(storeData.error || "Error al registrar la tienda");
                        return;
                    }
                    console.log("Tienda registrada OK:", storeData);
                    
                    const storeID = storeData.id; 
                    console.log(storeID);
                    
                    const adminRes = await fetch(`${environment.URL_API}/register/admin`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                            name: adminName, 
                            email, 
                            password,
                            storeID
                        })
                    });

                    const adminData = await adminRes.json();
                    if (!adminRes.ok) {
                        alert(adminData.error || "Error al registrar el administrador");
                        return;
                    }

                    
                    console.log("Administrador registrado OK:", adminData);
                    alert("¡Cuenta y tienda creadas exitosamente!");
                    openLoginModal(); 
                } catch (err) {
                    console.error("Fetch error:", err);
                    alert("Error al conectar con el servidor.");
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

customElements.define("mfe-register-admin", RegisterAdmin);