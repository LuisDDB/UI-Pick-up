import { environment } from "./config/environment.js";

export async function router() {

    const app = document.getElementById("app");
    const hash = location.hash;

    app.innerHTML = "";

    if (hash === "#/" || hash === "" || hash === "#/home") {
        app.innerHTML = `
            <h1 style="text-align:center; margin-top: 2rem;">
                Bienvenido a Pick Easy
            </h1>
        `;
    }

    else if (hash === "#/empleados") {

        try {
            await import("../employees/employees.js");
            const employeeView = document.createElement("mfe-employees");
            app.appendChild(employeeView);

        } catch (error) {
            console.error("Error cargando employees.js:", error);
            app.innerHTML = `
                <h3 style="color:red; text-align:center">
                    Error: No se encontró el archivo employees.js
                </h3>
            `;
        }
    }

    else if (hash === "#/registrar") {
        app.innerHTML = "<h2>Aquí irá el formulario de registro…</h2>";
    }

    else if (hash === "#/pedidos") {
        app.innerHTML = "<h2>Aquí van los pedidos…</h2>";
    }

    else {
        app.innerHTML = `
            <h2 style="text-align:center">
                404 — Página no encontrada
            </h2>
        `;
    }
}
