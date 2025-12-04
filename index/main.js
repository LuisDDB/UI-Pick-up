import { router } from "./router.js";

document.addEventListener("click", (e) => {
    if (e.target.matches("[data-route]")) {
        e.preventDefault();
        const url = e.target.getAttribute("href");

        window.history.pushState({}, "", url);

        router();
    }
});

window.addEventListener("popstate", router);


const btnLogin = document.getElementById("login-btn");
btnLogin.addEventListener("click", ()=>{
    openModal("mfe-login");
});

const btnRegister = document.getElementById("register-btn");
btnRegister.addEventListener("click", ()=>{
    openModal("mfe-register");
});

document.addEventListener("open-login",()=>{
    openModal("mfe-login");
})

document.addEventListener("open-register", ()=>{
    openModal("mfe-register");
});

function openModal(etiquta){
    const modal = document.createElement(etiquta);
    document.body.appendChild(modal);
}





