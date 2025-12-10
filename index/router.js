import { environment } from "./config/environment.js";

export async function router() {
    const app = document.getElementById("app");
    const path = location.pathname;

    // Obtener usuario logeado
    const account = JSON.parse(localStorage.getItem("user"));
    let typeAccount = account ? account.type : "NOTLOG";

    console.log("Tipo de cuenta:", typeAccount);

    app.innerHTML = "";

    try {
        if (path === "/" || path.startsWith("/home")) {
            await import(`${environment.URL_Home}/home.js`);
            app.innerHTML = `<mfe-home></mfe-home>`;
            return;
        }

        else if (path.startsWith("/store/")) {
            await import(`${environment.URL_Store}/product.js`);
            app.innerHTML = `<mfe-store></mfe-store>`;
            return;
        }

        else if (path.startsWith("/product/")) {
            await import(`${environment.URL_Product}/productDetail.js`);
            app.innerHTML = `<mfe-product></mfe-product>`;
            return;
        }

        else if (path.startsWith("/checkout")) {
            await import(`${environment.URL_Checkout}/checkout.js`);
            app.innerHTML = `<mfe-checkout></mfe-checkout>`;
            return;
        }

        else if (path.startsWith("/pedidos")) {

            if (typeAccount === "CLIENT") {
                await import(`${environment.URL_Order}/orderClient.js`);
                app.innerHTML = `<mfe-order-client></mfe-order-client>`;
                return;
            }

            else if (typeAccount === "ADMIN") {
                await import(`${environment.URL_Employees}/employees.js`);
                app.innerHTML = `<mfe-employees></mfe-employees>`;
                return;
            }

            else if (typeAccount === "NOTLOG") {
                let login = false
                history.pushState({}, "", "/");
                await import(`${environment.URL_Home}/home.js`);
                app.innerHTML = `<mfe-home></mfe-home>`;
                const modal = document.createElement("mfe-login");
                document.body.appendChild(modal);
                window.addEventListener("logged-in", () => {
                    history.pushState({}, "", "/pedidos");
                    router() 
                });

                return;
            }
        }

        else {
            app.innerHTML = `
                <h1>No se encontró la página</h1>
                <h2>Error 404</h2>
            `;
        }

    } catch (err) {
        console.error("Error cargando microfrontend:", err);
        app.innerHTML = `<h2>Error al cargar el módulo</h2>`;
    }
}



window.addEventListener("click", (e) => {
    const link = e.target.closest("[data-route]");
    if (!link) return;

    e.preventDefault();

    const url = link.getAttribute("href") || link.dataset.url;

    history.pushState({}, "", url);
    router();
});

window.addEventListener("popstate", router);

window.addEventListener("DOMContentLoaded", router);
