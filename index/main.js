import { router } from "./router.js";

window.addEventListener("hashchange", router);
window.addEventListener("load", router);


const btnLogin = document.getElementById("login-btn");
btnLogin.addEventListener("click", ()=>{
    const modal = document.createElement("mfe-login");
    document.body.appendChild(modal);
});

const btnRegister = document.getElementById("register-btn");
btnRegister.addEventListener("click", ()=>{
    const modal = document.createElement("mfe-register");
    document.body.appendChild(modal);
});


