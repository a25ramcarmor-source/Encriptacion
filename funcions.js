
// Botones
document.getElementById("generar").addEventListener("click", generarClaves);
document.getElementById("firmar").addEventListener("click", firmarMensaje);
document.getElementById("verificar").addEventListener("click", verificarFirma);


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


// 3. VERIFICAR FIRMA
function verificarFirma() {

    // Recuperamos el JSON del textarea
    const contenido = document.getElementById("sms").value;

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
