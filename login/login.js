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
                    <button type="button" class="btn close-btn">X</button>
                </div>
                <div class="center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-user"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /></svg>
                </div>

                <label class="label" for="email">Ingrese su email</label>
                <input class="input" name="email" type="email" placeholder="ejemplo@gmail.com" required />
                <label class="label" for="password">Ingrese su contraseña</label>
                <input class="input"name="password" type="password" placeholder="contraseña" required /> 

                <button class="btn" type="submit">Login</button>

                

            </form>
        </div>
        `;

        const componentInstance = this;
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

                if (!res.ok) {
                    alert(data.error || "Credenciales incorrectas");
                    return;
                }

                localStorage.setItem("token", data.token);

                location.hash = "#/home";
                closeModal();
            } catch (error) {
                console.error(error);
                alert("Error al conectar con el servidor");
            }
        })

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

        function closeModal() {
            componentInstance.remove()
        }

        




    }
}

customElements.define('mfe-login', Login)