import { exec } from "child_process";

function run(name, path, port) {
    console.log(`Iniciando ${name}...`);
    exec(`cd ${path} && npx serve -p ${port} --cors`, { shell: true });
    console.log(`http://192.168.100.14:${port}`)
}

run("index", "index", 4000);
run("Login MFE", "login", 4001);
run("Register MFE", "register", 4002);
run("Home MFE", "home", 4003);
run("Product MFE", "product", 4004);
run("Cart MFE", "cart", 4005);
run("ProductDetail MFE", "product-detail", 4006);
run("checkout MFE", "checkout", 4007);
run("employes MFE", "employees", 4008);
run("Order MFE", "orderClient", 4009);








