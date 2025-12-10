import { exec } from "child_process";

function run(name, path, port) {
    console.log(`Iniciando ${name}...`);
    exec(`cd ${path} && npx live-server --port=${port} --host=192.168.0.8 --cors --no-browser`, { shell: true });
    console.log(`http://192.168.0.8:${port}`)
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







