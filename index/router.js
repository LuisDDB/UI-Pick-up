import { environment } from "./config/environment.js";

export async function router() {
    const app = document.getElementById("app");
    const path = location.pathname;

    app.innerHTML = ""; 

    try {
        if (path === "/" || path.startsWith("/home")) {
            await import(`${environment.URL_Home}/home.js`);
            app.innerHTML = `<mfe-home></mfe-home>`;
        }

        else if (path.startsWith("/store/")) {
            await import(`${environment.URL_Store}/product.js`);
            app.innerHTML = `<mfe-store></mfe-store>`;
        }

        else if (path.startsWith("/product/")) {
            await import(`${environment.URL_Product}/productDetail.js`);
            app.innerHTML = `<mfe-product></mfe-product>`;
        }

        else if (path.startsWith("/checkout")) {
            await import(`${environment.URL_Checkout}/checkout.js`);
            app.innerHTML = `<mfe-checkout></mfe-checkout>`;
        }

        else {
            app.innerHTML = `<h1>No se encontró la pagina </h1>
                <h2>Error 404</h2>`;
        }

    } catch (err) {
        console.error("Error cargando microfrontend:", err);
        app.innerHTML = `<h2>Error al cargar el módulo</h2>`;
    }
}


window.addEventListener("click", (e) => {
    const link = e.target.closest("[data-route]");
    if (link) {
        e.preventDefault();
        history.pushState({}, "", link.href);
        router();
    }
});

window.addEventListener("popstate", router);

window.addEventListener("DOMContentLoaded", router);
