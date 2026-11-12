let contingut = document.querySelector('.container');

contingut.style.display = 'none';

addEventListener('click', (e)=>{
    if(e.target.id == "generar"){
        generarClaves();
    }
    if(e.target.id == "firmar"){
        firmarMensaje();
    }
    if(e.target.id == "verificar"){
        verificarFirma();
    }
    if(e.target.id == "cifrar"){
        cifrarMensaje();
    }
    if(e.target.id == "descifrar"){
        descifrarMensaje();
    }
});

document.getElementById('guardarnom').addEventListener('click', () => {

    let username = document.getElementById('nom').value;

    while (!username || username.trim() === '' || username.trim().length > 20) {

        alert('Introduce un nombre válido (máximo 20 caracteres)');

        return;
    }

    username = username.trim();

    console.log(username);

});

const socket = io({
    auth: {
        username: username
    }
});








// 1. GENERAR CLAVES
function generarClaves() {

    const crypt = new JSEncrypt({
        default_key_size: 2048
    });

    // Generamos las claves
    const publicKey = crypt.getPublicKey();
    const privateKey = crypt.getPrivateKey();

    // Mostramos las claves
    document.getElementById("clauPublica").value = publicKey;
    document.getElementById("clauPrivada").value = privateKey;

}


// 2. FIRMAR MENSAJE
function firmarMensaje() {

    // Obtenemos el mensaje
    const mensaje = document.getElementById("sms").value;

    // Obtenemos nuestra clave privada
    const privateKey = document.getElementById("clauPrivada").value;

    if (!mensaje || !privateKey) {
        alert("Escribe un mensaje y genera tus claves primero");
        return;
    }

    // Creamos el objeto para firmar
    const sign = new JSEncrypt();
    sign.setPrivateKey(privateKey);

    // Firmamos el mensaje utilizando SHA256
    const signature = sign.sign(mensaje, CryptoJS.SHA256, "sha256");

    if (!signature) {
        alert("No se ha podido firmar el mensaje");
        return;
    }

    // Creamos el objeto JSON
    const objeto = {
        missatge: mensaje,
        signatura: signature
    };

    // Lo convertimos a texto JSON
    document.getElementById("sms").value =
        JSON.stringify(objeto, null, 4);

}
function cifrarMensaje() {

    // Recuperamos el JSON firmado
    const contenido = document.getElementById("msn_json").value;

    // Recuperamos la clave pública del otro navegador
    const publicKey = document.getElementById("clauRemota").value;

    if (!contenido || !publicKey) {
        alert("Necesitas el JSON firmado y la clave pública remota");
        return;
    }

    try {

        // Generamos una clave AES aleatoria
        const claveAES = CryptoJS.lib.WordArray.random(32).toString();

        // Ciframos el JSON utilizando AES
        const mensajeCifrado = CryptoJS.AES.encrypt(
            contenido,
            claveAES
        ).toString();

        // Ciframos la clave AES utilizando RSA
        const rsa = new JSEncrypt();
        rsa.setPublicKey(publicKey);

        const claveCifrada = rsa.encrypt(claveAES);

        if (!claveCifrada) {
            alert("No se ha podido cifrar la clave AES");
            return;
        }

        // Creamos un objeto con los dos datos cifrados
        const objetoCifrado = {
            clave: claveCifrada,
            datos: mensajeCifrado
        };

        // Mostramos el resultado en el textarea
        document.getElementById("msn_cifrat").value =
            JSON.stringify(objetoCifrado);

        document.getElementById("resultado").textContent =
            "Mensaje cifrado correctamente";

    } catch (error) {

        document.getElementById("resultado").textContent =
            "Error al cifrar el mensaje";

    }
}

// 4. DESCIFRAR MENSAJE
function descifrarMensaje() {

    // Recuperamos el mensaje cifrado
    const contenido = document.getElementById("msn_rebut").value;

    // Recuperamos nuestra clave privada
    const privateKey = document.getElementById("clauPrivada").value;

    if (!contenido || !privateKey) {
        alert("Necesitas el mensaje cifrado y tu clave privada");
        return;
    }

    try {

        // Convertimos el JSON recibido en un objeto
        const objeto = JSON.parse(contenido);

        // Creamos el objeto RSA
        const rsa = new JSEncrypt();
        rsa.setPrivateKey(privateKey);

        // Desciframos la clave AES con nuestra clave privada
        const claveAES = rsa.decrypt(objeto.clave);

        if (!claveAES) {
            alert("No se ha podido descifrar la clave AES");
            return;
        }

        // Desciframos el mensaje utilizando AES
        const mensajeDescifrado = CryptoJS.AES.decrypt(
            objeto.datos,
            claveAES
        ).toString(CryptoJS.enc.Utf8);

        if (!mensajeDescifrado) {
            alert("No se ha podido descifrar el mensaje");
            return;
        }

        // Mostramos el JSON original
        document.getElementById("smsDescifrado").value =
            mensajeDescifrado;

        document.getElementById("resultado").textContent =
            "Mensaje descifrado correctamente";

    } catch (error) {

        document.getElementById("resultado").textContent =
            "Error al descifrar el mensaje";

    }
}

function verificarFirma() {

    // Recuperamos el JSON del textarea
    const contenido = document.getElementById("smsDescifrado").value;

    // Obtenemos la clave pública remota
    const publicKey = document.getElementById("clauRemota").value;

    try {

        // Convertimos el texto en un objeto JavaScript
        const objeto = JSON.parse(contenido);

        // Creamos el objeto para verificar
        const verify = new JSEncrypt();
        verify.setPublicKey(publicKey);

        // Comprobamos la firma
        const correcto = verify.verify(
            objeto.missatge,
            objeto.signatura,
            CryptoJS.SHA256
        );

        if (correcto) {
            document.getElementById("resultado").textContent =
                "¡Firma correcta! El mensaje no ha sido modificado.";
        } else {
            document.getElementById("resultado").textContent =
                "Firma incorrecta. El mensaje no pertenece a esta clave pública o ha sido modificado.";
        }

    } catch (error) {

        document.getElementById("resultado").textContent =
            "Error: el contenido no es un JSON válido.";

    }

}
