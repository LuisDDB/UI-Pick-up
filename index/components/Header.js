import { router } from "../router.js";

class Header extends HTMLElement {
    connectedCallback() {

        this.innerHTML = `
        <header class="header">
            <picture>
                <a href="/" data-route>
                    <img src="./assets/images/logo.png" alt="Logo" class="logo">
                </a>
            </picture>

            <div class="search">
                <label for="search-store" style="display: none;">Busca tiendas</label>
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
                    <li><button id="register-btn" class="link-btn">Registrarse</button></li>
                    <li><button id="login-btn" class="link-btn">Inicia sesión</button></li>
                    <li><a href="/pedidos" data-route>Mis pedidos</a></li>
                    <li><a href="/empleados" data-route>Info Empleado</a></li>
                    <li><button id="cart-btn" class="cart-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                            <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                            <path d="M17 17h-11v-14h-2" />
                            <path d="M6 5l14 1l-1 7h-13" />
                        </svg>
                    </button></li>
                    <li><button id="logout-btn" class="link-btn" style="display:none;">Cerrar sesión</button></li>
                </ul>
            </nav>
        </header>
        `;

        window.addEventListener("popstate", router);

        const btnCart = this.querySelector("#cart-btn");
        btnCart.addEventListener("click", () => {
            const cart = document.querySelector("#cartGlobal");
            cart.open();
        });

        const btnLogin = document.getElementById("login-btn");
        const btnRegister = document.getElementById("register-btn");
        const btnLogout = document.getElementById("logout-btn");

        btnLogin.addEventListener("click", () => openModal("mfe-login"));
        btnRegister.addEventListener("click", () => openModal("mfe-register"));

        function openModal(tag) {
            const modal = document.createElement(tag);
            document.body.appendChild(modal);
        }

        document.addEventListener("open-login", () => openModal("mfe-login"));
        document.addEventListener("open-register", () => openModal("mfe-register"));

        // Logout functionality
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("client"); // remove session
            location.reload(); // reload page to reset header
        });

        window.addEventListener("logged-in", () => {
            this.updateAuthState(btnLogin, btnRegister, btnLogout);
        });

        this.updateAuthState(btnLogin, btnRegister, btnLogout);
    }

    updateAuthState(btnLogin, btnRegister, btnLogout) {
        const user = JSON.parse(localStorage.getItem("client"));
        console.log("header status:", user);

        if (!btnLogin || !btnRegister || !btnLogout) return;

        if (user && user.id) {
            btnLogin.style.display = "none";
            btnRegister.style.display = "none";
            btnLogout.style.display = "block"; // show logout button
        } else {
            btnLogin.style.display = "block";
            btnRegister.style.display = "block";
            btnLogout.style.display = "none"; // hide logout button
        }
    }
}

customElements.define('mfe-header', Header);
