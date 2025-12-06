const { exec } = require("child_process");

function run(name, path, port) {
    console.log(`Iniciando ${name}...`);
    exec(`cd ${path} && npx serve -p ${port} --cors`, { shell: true });
    console.log(`http://192.168.1.10:${port}`)
}

run("index", "index", 4000);
run("Login MFE", "login", 4001);
run("Register MFE", "register", 4002);
run("AddProduc MFE", "addProduct", 4003);
run("Store MFE", "store", 4004);