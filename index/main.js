import { router } from "./router.js";

window.addEventListener("hashchange", router);
window.addEventListener("load", router);


const btnLogin = document.getElementById("login-btn");
btnLogin.addEventListener("click", ()=>{
    openModal("mfe-login");
});

const btnRegister = document.getElementById("register-btn");
btnRegister.addEventListener("click", ()=>{
    openModal("mfe-register");
});

document.addEventListener("open-login",()=>{
    openModal("mfe-login")
})

function openModal(etiquta){
    const modal = document.createElement(etiquta);
    document.body.appendChild(modal);
}





