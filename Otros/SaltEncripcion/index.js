let abecedario = "abcdefghijklmnñopqrstuvwxyz"
let salt;
let hash;

// genera string de n caracteres aleatorios
function generarSalt(n) {
    let res = [];
    let pos;
    for (let i = 0; i < n; i++) {
        pos = Math.floor(Math.random() * abecedario.length);
        res.push(abecedario.charAt(pos));
    }
    return res.join("");
}

// toma un string y lo "mezcla", este resultado se guarda en BD
async function hashear(s) {
    // hay que convertir el string a un Uint8Array
    const arreglo = new TextEncoder().encode(s);
    const cryptoResultado = await crypto.subtle.digest("SHA-256", arreglo);

    // hay que transformar el output de crypto.subtle.digest en Uint8Array
    const arregloHash = Array.from(new Uint8Array(cryptoResultado));

    // hay que convertir el Uint8Array en string
    return arregloHash.map(b => b.toString(16).padStart(2, "0")).join("");
}

document.getElementById("miEnviar").onclick = async function () {
    // extrer valor de caja de texto
    const contra = document.getElementById("miTexto").value;

    // esta informacion se debe guardar en el objeto
    salt = generarSalt(4); 

    // esta informacion tambien
    hash = await hashear(contra + salt); 

    document.getElementById("miContra").textContent = `Su contraseña es: ${contra}`;
    document.getElementById("miSalt").textContent = `Su salt es: ${salt}`;
    document.getElementById("miHash").textContent = `Contraseña en BD: ${hash}`;
}

document.getElementById("miEnviar2").onclick = async function () {
    const contra = document.getElementById("miTexto2").value;
    const resultadoHash = await hashear(contra + salt);
    if (resultadoHash === hash) {
        document.getElementById("verificar").textContent = `Todo bien`
    } else {
        document.getElementById("verificar").textContent = `La contraseña es incorrecta`
    }
}
