import { environment } from "./config/environment.js";

class AdminDashboard extends HTMLElement {
    constructor() {
        super();
        this.employees = [];
        this.stores = [];
        this.products = [];
        const userStr = localStorage.getItem("user");
        this.user = userStr ? JSON.parse(userStr) : null;
    }

    connectedCallback() {
        this.render();
        this.bindSidebar();
        this.loadEmployees();
    }

    render() {
        this.innerHTML = `
        <style>@import url('${environment.URL_Admin}/style/admin.css');</style>
        <div class="admin-container">
            <aside class="sidebar">
                <h3>Admin Panel</h3>
                <button class="menu-btn active" id="btn-employees">Employees</button>
                <button class="menu-btn" id="btn-stores">Stores</button>
                <button class="menu-btn" id="btn-products">Products</button>
            </aside>
            <main class="main-content" id="content-area">
                <div style="padding:2rem; text-align:center;">Select a section</div>
            </main>
        </div>`;
    }

    // ------------------- LOAD DATA -------------------
    async loadEmployees() {
        const content = this.querySelector("#content-area");
        content.innerHTML = "<h3>Loading Employees...</h3>";
        try {
            const res = await fetch(`${environment.URL_API}/employees`);
            this.employees = await res.json();
            this.renderEmployees();
        } catch(e){ content.innerHTML = "<p>Error loading employees</p>"; }
    }

    async loadStores() {
        const content = this.querySelector("#content-area");
        content.innerHTML = "<h3>Loading Stores...</h3>";
        try {
            const res = await fetch(`${environment.URL_API}/store`);
            this.stores = await res.json();
            this.renderStores();
        } catch(e){ content.innerHTML = "<p>Error loading stores</p>"; }
    }

    async loadProducts() {
        const content = this.querySelector("#content-area");
        content.innerHTML = "<h3>Loading Products...</h3>";
        try {
            const res = await fetch(`${environment.URL_API}/product/store/1`); // default first store
            this.products = await res.json();
            this.renderProducts();
        } catch(e){ content.innerHTML = "<p>Error loading products</p>"; }
    }

    renderEmployees() {
        const content = this.querySelector("#content-area");
        content.innerHTML = `
            <h2>Employees</h2>
            <button id="add-employee-btn">➕ Add Employee</button>
            <ul>
                ${this.employees.map(e=>`<li>${e.name} (${e.email}) 
                <button onclick="document.querySelector('mfe-admin').deleteEmployee(${e.id})">🗑️</button></li>`).join('')}
            </ul>`;
        this.querySelector("#add-employee-btn").addEventListener("click", ()=>this.showAddEmployeeForm());
    }

    renderStores() {
        const content = this.querySelector("#content-area");
        content.innerHTML = `
            <h2>Stores</h2>
            <button id="add-store-btn">➕ Add Store</button>
            <ul>
                ${this.stores.map(s=>`<li>${s.name} - ${s.address} 
                <button onclick="document.querySelector('mfe-admin').deleteStore(${s.store_id})">🗑️</button></li>`).join('')}
            </ul>`;
        this.querySelector("#add-store-btn").addEventListener("click", ()=>this.showAddStoreForm());
    }

    renderProducts() {
        const content = this.querySelector("#content-area");
        content.innerHTML = `
            <h2>Products</h2>
            <button id="add-product-btn">➕ Add Product</button>
            <ul>
                ${this.products.map(p=>`<li>${p.name} ($${p.price}) 
                <button onclick="document.querySelector('mfe-admin').deleteProduct(${p.product_id})">🗑️</button></li>`).join('')}
            </ul>`;
        this.querySelector("#add-product-btn").addEventListener("click", ()=>this.showAddProductForm());
    }

    // ------------------- ACTIONS -------------------
    async deleteEmployee(id){
        if(!confirm("Delete this employee?")) return;
        await fetch(`${environment.URL_API}/employees/${id}`,{method:'DELETE'});
        this.loadEmployees();
    }

    async deleteStore(id){
        if(!confirm("Delete this store?")) return;
        await fetch(`${environment.URL_API}/store/${id}`,{method:'DELETE'});
        this.loadStores();
    }

    async deleteProduct(id){
        if(!confirm("Delete this product?")) return;
        await fetch(`${environment.URL_API}/product/${id}`,{method:'DELETE'});
        this.loadProducts();
    }

    showAddEmployeeForm(){
        const name = prompt("Name:");
        const email = prompt("Email:");
        const password = prompt("Password:");
        if(!name || !email || !password) return;
        fetch(`${environment.URL_API}/employees`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({name,email,password})
        }).then(()=>this.loadEmployees());
    }

    showAddStoreForm(){
        const name = prompt("Store Name:");
        const address = prompt("Address:");
        if(!name) return;
        fetch(`${environment.URL_API}/store`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({name,address})
        }).then(()=>this.loadStores());
    }

    showAddProductForm(){
        const name = prompt("Product Name:");
        const price = prompt("Price:");
        const store_id = prompt("Store ID:");
        if(!name || !price || !store_id) return;
        fetch(`${environment.URL_API}/product`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({name,price,store_id})
        }).then(()=>this.loadProducts());
    }

    // ------------------- SIDEBAR -------------------
    bindSidebar(){
        const btnEmp = this.querySelector("#btn-employees");
        const btnStore = this.querySelector("#btn-stores");
        const btnProd = this.querySelector("#btn-products");

        const setActive = btn=>{
            this.querySelectorAll(".menu-btn").forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
        };

        btnEmp.addEventListener("click", ()=>{ this.loadEmployees(); setActive(btnEmp); });
        btnStore.addEventListener("click", ()=>{ this.loadStores(); setActive(btnStore); });
        btnProd.addEventListener("click", ()=>{ this.loadProducts(); setActive(btnProd); });
    }
}

customElements.define('mfe-admin', AdminDashboard);
