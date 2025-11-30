import { environment } from "./config/environment.js";

class Register extends HTMLElement{
    connectedCallback(){
        this.innerHTML = `
            <style>
                @import url(${environment.URL_Register}/style/register.css)
            </style>
            <div class="modal">
                <form id="form-register" class="form-register">
                    <label class="label" for="name">Nombre completo</label>
                    <input class="input" name="name" type="text" placeholder="Luis Domínguez" tabindex="1" required />
                    <label class="label" for="email"> Email </label> 
                    <input class="input" name="email" type="email" placeholder="ejemplo@gmail.com" required />
                    <label class="label" for="password"> Contraseña </label>
                    <input class="input" name="password" type="password" placeholder="contraseña" required/>

                    <button class="btn" type="submit"> Registrarse </button>

                    <button type="button" id="toLogin" class="btn-enlace">
                         ¿Ya tienes una cuenta? <span>Inicia sesión aquí</span>
                    </button>
                </form>
            </div>
        `;


        const componentInstance = this;
        const formRegister = this.querySelector("#form-register") 

        formRegister.addEventListener("submit", async(e)=>{
            e.preventDefault();
            const name = formRegister["name"].value;
            const email = formRegister["email"].value;
            const password= formRegister["password"].value;

            try{
                const res = await fetch(`${environment.URL_API}/register`, {
                    method: "POST",
                    headers: {"Content-type": "application/json"},
                    body: JSON.stringify({name, email, password})
                });

                const data = await res.json()

                if(!res.ok){
                    alert(data.error);
                    return;
                }
                console.log(data);

            }catch(error){
                alert("Error al conectar el servidor");
                console.log(error.message);
            }

        })
        const modal= this.querySelector(".modal");
        modal.addEventListener("click", (e)=>{
            if(e.target==modal){
                closeModal();
            }
        })
        

        const btnToLogin = this.querySelector("#toLogin");
        
        btnToLogin.addEventListener("click",()=>{
            componentInstance.dispatchEvent(new CustomEvent("open-login",{
                bubbles: true,
                composed:true
            }))
            closeModal();
        })

        function closeModal(){
            componentInstance.remove();
        }
        


    }



}

customElements.define("mfe-register", Register);