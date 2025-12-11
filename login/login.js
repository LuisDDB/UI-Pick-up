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
                    <button type="button-close" class="close-btn">X</button>
                </div>

                <label class="label" for="email">Ingrese su email</label>
                <input class="input" name="email" type="email" placeholder="ejemplo@gmail.com" required />
                <label class="label" for="password">Ingrese su contraseña</label>
                <input class="input"name="password" type="password" placeholder="contraseña" required /> 
                
                <div id="errorMessage" class="error-message"></div>

                <button class="btn" type="submit">Login</button>

                <button type="button" id="toRegister" class="btn-enlace">
                    ¿No tienes una cuenta? <span>Crea una cuenta</span>
                </button>

            </form>
        </div>
        `;

        const componentInstance = this;
        const formLogin = this.querySelector("#loginForm");
        const errorMessageDiv = this.querySelector("#errorMessage");

        function displayError(message) {
            if (message) {
                errorMessageDiv.textContent = message;
                errorMessageDiv.classList.add('show');
            } else {
                errorMessageDiv.textContent = '';
                errorMessageDiv.classList.remove('show');
            }
        }
        
        function handleLoginSuccess(data, role) {
            const userData = data[role];
            
            localStorage.setItem("user", JSON.stringify({
                "id": userData.id,
                "name": userData.name,
                "type": userData.type,
                "token": userData.token,
                "store_id": userData.idStore

            }));

            window.dispatchEvent(new CustomEvent("logged-in", {
                detail: { user: data }
            }));

            closeModal();
        }

        formLogin.addEventListener("submit", async e => {
            e.preventDefault();
            displayError(null);
            
            const email = formLogin["email"].value;
            const password = formLogin["password"].value;
            const body = JSON.stringify({ email, password });
            const headers = { "Content-Type": "application/json" };
            
            let loggedIn = false;

            try {
                const resClient = await fetch(`${environment.URL_API}/login`, {
                    method: "POST",
                    headers: headers,
                    body: body
                });

                if (resClient.ok) {
                    const data = await resClient.json();
                    console.log(data);

                    handleLoginSuccess(data, "client");
                    loggedIn = true;
                } 

            } catch (error) {
                console.error(error);
            }

            if (!loggedIn) {
                try {
                    const resAdmin = await fetch(`${environment.URL_API}/login/admin`, {
                        method: "POST",
                        headers: headers,
                        body: body
                    });

                    if (resAdmin.ok) {
                        const data = await resAdmin.json();
                        console.log(data);
                        handleLoginSuccess(data, "admin"); 
                        loggedIn = true;
                    } 

                } catch (error) {
                    console.error(error);
                }
            }

            if (!loggedIn) {
                displayError("Email o contraseña incorrectos.");
            }
        });

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
        
        const btnToRegister = this.querySelector("#toRegister");
        btnToRegister.addEventListener("click",openRegisterLogin);
        function openRegisterLogin(){
            componentInstance.dispatchEvent(new CustomEvent("open-register",{
                bubbles: true,
                composed: true
            }))
            closeModal();
        }

        function closeModal() {
            componentInstance.remove()
        }
    }
}

customElements.define('mfe-login', Login);