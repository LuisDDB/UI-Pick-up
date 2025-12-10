import { environment } from "./config/environment.js";

class Login extends HTMLElement {


    connectedCallback() {
        this.innerHTML =
            `
        <style>
            @import url(${environment.URL_Login}/style/login.css);
        </style>
        <div id="modal" class="modal">
            <form id="loginForm" class="form-login">
                <div class="form-header">
                    <h2>Iniciar sesión</h2>
                    <button type="button" class="btn close-btn">X</button>
                </div>

                <label class="label" for="email">Ingrese su email</label>
                <input class="input" name="email" type="email" placeholder="ejemplo@gmail.com" required />
                <label class="label" for="password">Ingrese su contraseña</label>
                <input class="input"name="password" type="password" placeholder="contraseña" required /> 

                <button class="btn" type="submit">Login</button>

                <button type="button" id="toRegister" class="btn-enlace">
                    ¿No tienes una cuenta? <span>Crea una cuenta</span>
                </button>

            </form>
        </div>
        `;

        const componentInstance = this;


        //Manejo del login
        const formLogin = document.getElementById("loginForm");
        formLogin.addEventListener("submit", async e => {
            e.preventDefault();
            const email = formLogin["email"].value;
            const password = formLogin["password"].value;

            try {
                const res = await fetch(`${environment.URL_API}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                console.log(data);

                if (!res.ok) {
                    alert(data.error || "Credenciales incorrectas");
                    return;
                }

                localStorage.setItem("user", JSON.stringify({
                    "id":data.client.id,
                    "name": data.client.name,
                    "type": data.client.type,
                    "token": data.client.token
                }))

                window.dispatchEvent(new CustomEvent("logged-in",{
                    detail: {user: data}
                }));


                closeModal();
            } catch (error) {
                console.error(error);
                alert("Error al conectar con el servidor");
            }
        })

        //Cerrar el modal
        const modal = this.querySelector("#modal");
        const btnClose = this.querySelector(".close-btn");
        btnClose.addEventListener("click" ,() =>{
            closeModal();
        })
        modal.addEventListener("click", e => {
            if(e.target === modal){
                closeModal();
            }
        });
        
        //Mandar al registro
        const btnToRegister = this.querySelector("#toRegister");
        btnToRegister.addEventListener("click",openRegisterLogin);
        function openRegisterLogin(){
            componentInstance.dispatchEvent(new CustomEvent("open-register",{
                bubbles: true,
                composed: true
            }))
            closeModal();
        }

        /**
         * Elimina el elemento modal
         */
        function closeModal() {
            componentInstance.remove()
        }

        




    }
}

customElements.define('mfe-login', Login)