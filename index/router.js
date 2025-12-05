import { environment } from "./config/environment.js";

export async function router() {
    
    const app = document.getElementById("app");

    const path = window.location.pathname; 
    console.log("Ruta actual:", path);

    app.innerHTML = "";
    
    let componentTag = ""; 
    let componentUrl = "";


    switch (path) {
        case "/":
            componentUrl = `${environment.URL_Home}/home.js`;
            componentTag = "mfe-home";
            break;

        case "/pedidos":
            
            break;

        default:
            app.innerHTML = "<h1>404 - No encontrado</h1>";
            break;
    }
    await import(componentUrl);
    app.innerHTML = `<${componentTag}></${componentTag}>`;

}
