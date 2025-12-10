import { router } from "../router.js";

class Header extends HTMLElement {
    connectedCallback() {

        this.innerHTML =
            `
        <header class="header">
            <picture> <!--Logo-->
                <a href="/" data-route>
                    <img src="./assets/images/logo.png" alt="Logo" class="logo">
                </a>
            </picture>

            <div class="search"><!--Busqueda de tienda-->
                <label for="search-store" style="display: none;"> Busca tiendas</label>
                <input type="text" id="search-store" name="search-store" class="search-bar"
                    placeholder="Encuentra tu tienda preferida">
                <div class="search-btn-bg">
                    <button class="search-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                            <path d="M21 21l-6 -6" />
                        </svg>
                    </button>
                </div>

            </div>
            <nav class="nav"> 
                <ul>
                    <li>
                        <button id="register-btn" class="link-btn">Registrarse</button>
                    </li>
                    <li>
                        <button id="login-btn" class="link-btn">Inicia sesión</button>
                    </li>
                    <li>
                        <a href="/pedidos" data-route> Mis pedidos</a>
                    </li>
                    <li>
                        <a href="/empleados" data-route>Info Empleado</a>
                    </li>
                    <li>
                        <button id="cart-btn" class="cart-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                <path d="M17 17h-11v-14h-2" />
                                <path d="M6 5l14 1l-1 7h-13" />
                            </svg>
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
            `



        window.addEventListener("popstate", router);

        const btnCart = this.querySelector("#cart-btn");

        btnCart.addEventListener("click", () => {
            const cart = document.querySelector("#cartGlobal");
            cart.open();
        });



        const btnLogin = document.getElementById("login-btn");
        btnLogin.addEventListener("click", () => {
            openModal("mfe-login");
        });

        const btnRegister = document.getElementById("register-btn");
        btnRegister.addEventListener("click", () => {
            openModal("mfe-register");
        });

        document.addEventListener("open-login", () => {
            openModal("mfe-login");
        })

        document.addEventListener("open-register", () => {
            openModal("mfe-register");
        });

        function openModal(etiquta) {
            const modal = document.createElement(etiquta);
            document.body.appendChild(modal);
        }

        window.addEventListener("logged-in", () => {
            this.updateAuthState(btnLogin, btnRegister);
        });

        this.updateAuthState(btnLogin, btnRegister);




    }
    
updateAuthState(btnLogin, btnRegister) {
        // Obtenemos el usuario (será null si no hay sesión)
        const user = JSON.parse(localStorage.getItem("user"));
        console.log("header status:", user);

        if (!btnLogin || !btnRegister) return;
        if (user && user.id) {
            btnLogin.style.display = "none";
            btnRegister.style.display = "none";
        } else {
            btnLogin.style.display = "block";
            btnRegister.style.display = "block";
        }
    }

}

customElements.define('mfe-header', Header);