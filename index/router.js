// index/router.js
import { environment } from "./config/environment.js";
// 1. IMPORTANTE: Importamos el nuevo componente para que el navegador lo reconozca
import "../orders/orders.js"; 

export async function router() {
    
    const app = document.getElementById("app");
    const hash = location.hash;

    // Limpiamos la pantalla antes de mostrar la nueva vista
    app.innerHTML = "";

    // Lógica de navegación (Switch)
    if (hash === '#/pedidos') {
        // Si la ruta es pedidos, inyectamos nuestro componente
        app.innerHTML = "<mfe-orders></mfe-orders>";
    } else if (hash === '#/home' || hash === '') {
        // Aquí iría tu home (puedes poner un mensaje temporal)
        app.innerHTML = "<h2>Bienvenido al Home (En construcción)</h2>";
    } else if (hash === '#/registrar') {
        app.innerHTML = "<h2>Registro (En construcción)</h2>";
    }
}