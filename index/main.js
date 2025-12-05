import { router } from "./router.js";
import { environment } from "./config/environment.js";


document.addEventListener("click", (e) => {
    if (e.target.matches("[data-route]")) {
        e.preventDefault();
        history.pushState({}, "", e.target.href);
        router();
    }
});


const componentUrl = `${environment.URL_Home}/home.js`;
const componentTag = "mfe-home"
const app = document.getElementById("app");
await import(componentUrl);
app.innerHTML = `<${componentTag}></${componentTag}>`;
