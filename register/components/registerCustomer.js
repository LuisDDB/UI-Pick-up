    import { environment } from "../config/environment.js";

    console.log("CARGANDO registerCustomer.js");


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
            if (formRegister) {
                formRegister.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    const name = formRegister["name"].value;
                    const email = formRegister["email"].value;
                    const password = formRegister["password"].value;

                    try {
                        const res = await fetch(`${environment.URL_API}/register`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ name, email, password })
                        });

                        const data = await res.json();
                        if (!res.ok) {
                            alert(data.error || "Error en el registro");
                            return;
                        }
                        console.log("Registro OK:", data);
                        openLoginModal();
                    } catch (err) {
                        console.error("Fetch error:", err);
                        alert("Error al conectar el servidor");
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
