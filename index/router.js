import { environment } from "./config/environment.js";

export async function router() {
    
    const app = document.getElementById("app");
    
    // Obtenemos la ruta actual del navegador
    const hash = location.hash;

    // 1. LIMPIAR PANTALLA
    // Borramos lo que había antes (el login, el home, etc.)
    app.innerHTML = "";

    // ==========================================
    // RUTA: HOME (INICIO)
    // ==========================================
    if (hash === '#/' || hash === '' || hash === '#/home') {
        app.innerHTML = `<h1 style="text-align:center; margin-top: 2rem;">Bienvenido a Pick Easy</h1>`; 
    }

    // ==========================================
    // RUTA: EMPLEADOS (La que queremos probar)
    // ==========================================
    else if (hash === '#/empleados') {
        
        // --- ZONA DE SEGURIDAD (COMENTADA TEMPORALMENTE) ---
        // Descomenta esto cuando ya tengas el Login funcionando con Backend real
        /*
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Acceso denegado. Inicia sesión primero.");
            window.location.hash = "#/";
            return;
        }
        */
       // ----------------------------------------------------

        try {
            // 2. CARGA DINÁMICA (Lazy Loading)
            // Esto va a buscar tu archivo employees.js solo cuando entres aquí
            await import("../employees/employees.js");

            // 3. CREAR LA ETIQUETA
            // Esto equivale a escribir <mfe-employees></mfe-employees> en el HTML
            const employeeView = document.createElement("mfe-employees");
            
            // 4. MOSTRAR EN PANTALLA
            app.appendChild(employeeView);

        } catch (error) {
            console.error("No se pudo cargar el módulo de empleados:", error);
            app.innerHTML = "<h3 style='color:red; text-align:center'>Error: No encuentro el archivo employees.js</h3>";
        }
    }

    // ==========================================
    // RUTA: REGISTRO (Ejemplo)
    // ==========================================
    else if (hash === '#/registrar') {
        app.innerHTML = "<h2>Aquí iría el formulario de registro...</h2>";
    }

    // ==========================================
    // RUTA: PEDIDOS (Ejemplo)
    // ==========================================
    else if (hash === '#/pedidos') {
        app.innerHTML = "<h2>Aquí irían los pedidos...</h2>";
    }

    // ==========================================
    // 404 - NO ENCONTRADO
    // ==========================================
    else {
        app.innerHTML = "<h2 style='text-align:center'>404 - Página no encontrada</h2>";
    }
}