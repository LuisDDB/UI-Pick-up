import { router } from "./router.js";
import { environment } from "./config/environment.js";

document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-route]");
    if (!el) return;

    e.preventDefault();

    const url = el.getAttribute("href") || el.dataset.url;
    if (!url) {
        console.warn("Elemento con data-route no tiene URL: ", el);
        return;
    }

    history.pushState({}, "", url);
    router();
});

window.addEventListener("navigate", (e) => {
    const url = e.detail?.url;
    if (!url) {
        console.warn("Error en navigate:", e);
        return;
    }

    history.pushState({}, "", url);
    router();
});


document.addEventListener("close-model", (e) => {
    e.target.remove();
});

document.addEventListener("open-detail", (e) => {
    const productCard = e.target.closest('mfe-product-card');
    if (!productCard || !productCard._product) {
        console.error("No se pudo obtener la información del producto para el modal.");
        return;
    }
    const modal = document.createElement("mfe-product-detail");
    modal.product = productCard._product;
    document.body.appendChild(modal);
})



const componentUrl = `${environment.URL_Home}/home.js`;
const componentTag = "mfe-home";
const app = document.getElementById("app");

await import(componentUrl);
app.innerHTML = `<${componentTag}></${componentTag}>`;
