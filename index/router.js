import { environment } from "./config/environment.js";

export async function router() {
    const app = document.getElementById("app");
    const path = location.pathname;
    const typeAccount = JSON.parse(localStorage.getItem("user")).type
    console.log(typeAccount);

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
        else if (path.startsWith("/empleado")) {
            await import(`${environment.URL_Checkout}/checkout.js`);
            app.innerHTML = `<mfe-checkout></mfe-checkout>`;
        }
        else if (path.startsWith("/pedidos")) {
            if(typeAccount==="CLIENT"){
                await import(`${environment.URL_Order}/orderClient.js`);
                app.innerHTML = `<mfe-order-client></mfe-order-client>`;
                console.log("cliente")
            }else{
                console.log("admin")
                await import(`${environment.URL_Employees}/employees.js`);
                app.innerHTML = `<mfe-employees></mfe-employees>`;
            }
           
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
