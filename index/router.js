import { environment } from "./config/environment.js";

export async function router() {
    
    const app = document.getElementById("app");

    const path = window.location.pathname; 
    console.log("Ruta actual:", path);

    app.innerHTML = "";

    switch (path) {
        case "/":
            app.innerHTML = "<h1>Home</h1>";
            break;

        case "/pedidos":
            app.innerHTML = "<h1>Pedidos</h1>";
            break;
        case "/mi-tienda":
            
            const storePage = document.createElement('mfe-store-page');
            
            
            app.appendChild(storePage);
            break;

        default:
            app.innerHTML = "<h1>404 - No encontrado</h1>";
            break;
    }
}
