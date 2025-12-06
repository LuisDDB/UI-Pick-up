// ARCHIVO: index/router.js
import { environment } from "./config/environment.js";

export async function router() {
    
    const app = document.getElementById("app");
    const hash = location.hash;

    // 1. Limpiar pantalla anterior
    app.innerHTML = "";

    // --- RUTA: EMPLEADOS ---
    if (hash === "#/empleados") {
        try {
            // Carga dinámica del archivo que creamos antes
            await import("../employees/employees.js");
            
            // Crea e inyecta el componente
            const dashboard = document.createElement("mfe-employees");
            app.appendChild(dashboard);
            
        } catch (error) {
            console.error("Error cargando el módulo de empleados:", error);
            app.innerHTML = `<h3 style="color:red; text-align:center; margin-top:2rem;">Error: No se encuentra el archivo employees/employees.js</h3>`;
        }
    }
    
    // --- RUTA: HOME (Por defecto) ---
    else if (hash === "#/" || hash === "" || hash === "#/home") {
        app.innerHTML = `
            <div style="text-align:center; margin-top: 4rem;">
                <h1>Bienvenido a Pick Easy</h1>
                <p>Selecciona una opción del menú para comenzar.</p>
            </div>
        `;
    }

    // --- RUTA: PEDIDOS (Si ya tienes la carpeta orders) ---
    else if (hash === "#/pedidos") {
        try {
            await import("../orders/orders.js");
            app.appendChild(document.createElement("mfe-orders"));
        } catch (error) {
            app.innerHTML = "<h2>Módulo de Pedidos no encontrado.</h2>";
        }
    }
    
    // --- RUTA 404 ---
    else {
        app.innerHTML = `<h2 style="text-align:center; margin-top:2rem;">Página no encontrada</h2>`;
    }
}