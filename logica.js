var peticionHttp = new XMLHttpRequest();

var tr;


window.onload = inicializar;



function inicializar() {
    var btnCerrar = document.getElementById("btnCerrar");
    btnCerrar.addEventListener("click", cerrar);
    var btnModificar = document.getElementById("btnModificar");
    btnModificar.addEventListener("click", modificar);
    var btnEliminar = document.getElementById("btnEliminar");
    btnEliminar.addEventListener("click", eliminar);
    getPersonas();
}

function realizarPeticionGet(url, metodo, funcion) {
    abrirLoading();
    peticionHttp.onreadystatechange = funcion;
    peticionHttp.open(metodo, url, true);

    peticionHttp.send();
}


function respuesta() {
    if (peticionHttp.readyState == 4) {
        if (JSON.parse(peticionHttp.responseText).type == "ok") {
            console.log("Materia modificada correctamente");
            actualizarDatos();
        }
        else {
            console.log("Error");
        }
        cerrarLoading();
    }
}

function getPersonas() {
    realizarPeticionGet("http://localhost:3000/materias", "GET", respuestaGrilla);
}

function modificarPersona() {
    realizarPeticionPost("http://localhost:3000/editar", "POST", respuesta);
}

function actualizarDatos() {
    tr.childNodes[0].textContent = document.getElementById("name").value;
    tr.childNodes[2].textContent = parseFechaApi(document.getElementById("fechaFinal").value);
    tr.childNodes[3].textContent = obtenerTurno();
    cerrar();
}

function obtenerTurno() {
    return document.getElementById("noche").checked ? "Noche" : "Mañana";
}

function realizarPeticionPost(url, metodo, funcion) {
    abrirLoading();
    peticionHttp.onreadystatechange = funcion;
    peticionHttp.open(metodo, url, true);
    peticionHttp.setRequestHeader("Content-Type", "application/json");

    var json = {
        "id": tr.getAttribute("id"),
        "nombre": document.getElementById("name").value,
        "cuatrimestre": tr.childNodes[1].textContent,
        "fechaFinal": parseFechaApi(document.getElementById("fechaFinal").value),
        "turno": obtenerTurno()
    }
    peticionHttp.send(JSON.stringify(json));
}

function respuestaGrilla() {
    if (peticionHttp.readyState == 4) {
        if (peticionHttp.status == 200) {
            llenarGrilla(peticionHttp.responseText);
        }
        cerrarLoading();
    }
}

function llenarGrilla(mat) {
    var tCuerpo = document.getElementById("tCuerpo");

    var materias = JSON.parse(mat);

    materias.forEach(materia => {
        var tr = document.createElement("tr");

        tr.setAttribute("id", materia.id);

        var td1 = document.createElement("td");
        var nodoTexto1 = document.createTextNode(materia.nombre);
        td1.appendChild(nodoTexto1);
        tr.appendChild(td1);

        var td2 = document.createElement("td");
        var nodoTexto2 = document.createTextNode(materia.cuatrimestre);
        td2.appendChild(nodoTexto2);
        tr.appendChild(td2);

        var td3 = document.createElement("td");
        var nodoTexto3 = document.createTextNode(materia.fechaFinal);
        td3.appendChild(nodoTexto3);
        tr.appendChild(td3);

        var td4 = document.createElement("td");
        var nodoTexto4 = document.createTextNode(materia.turno);
        td4.appendChild(nodoTexto4);
        tr.appendChild(td4);

        tr.addEventListener("dblclick", clickGrilla);

        tCuerpo.appendChild(tr);
    });
}

function abrirLoading() {
    document.getElementById("loading").hidden = false;
    document.getElementById("contenedor").hidden = true;
}

function cerrarLoading() {
    document.getElementById("loading").hidden = true;
    document.getElementById("contenedor").hidden = false;
}

function eliminar() {
    abrirLoading();
    peticionHttp.onreadystatechange = function () {

        if (peticionHttp.readyState == 4) {
            if(JSON.parse(peticionHttp.responseText).type == "ok"){
                console.log("Eliminado correctamente");
                tr.remove();
            }
            else{
                console.log("Error al eliminar");
            }
            cerrarLoading();
        }

    }
    peticionHttp.open("POST", "http://localhost:3000/eliminar", true);
    peticionHttp.setRequestHeader("Content-Type", "application/json");

    var json = {
        "id": tr.getAttribute("id"),
    }
    peticionHttp.send(JSON.stringify(json));

    cerrar();
}

function modificar() {
    if (checkInputs()) {
        modificarPersona();
    }
}

function clickGrilla(e) {
    document.getElementById("contenedorModificar").hidden = false;
    tr = e.target.parentNode;
    document.getElementById("name").value = tr.childNodes[0].textContent;
    document.getElementById("fechaFinal").value = parseFechaTabla(tr.childNodes[2].textContent);
    if (tr.childNodes[3].textContent == "Noche") {
        document.getElementById("noche").checked = true;
    }
    else {
        document.getElementById("manana").checked = true;
    }
    switch (tr.childNodes[1].textContent) {
        case "1":
            document.getElementById("cuatrimestre").value = "1";
            break;
        case "2":
            document.getElementById("cuatrimestre").value = "2";
            break;
        case "3":
            document.getElementById("cuatrimestre").value = "3";
            break;
        case "4":
            document.getElementById("cuatrimestre").value = "4";
            break;
    }
    document.getElementById("cuatrimestre").setAttribute("disabled", "disabled");
}

function cerrar() {
    document.getElementById("name").value = "";
    document.getElementById("name").className = "sinError";
    document.getElementById("fechaFinal").className = "sinError";
    document.getElementById("contenedorModificar").hidden = true;
}

function checkInputs() {
    var retorno = true;
    var nombre = document.getElementById("name");
    var fecha = document.getElementById("fechaFinal");
    var fechaMod = new Date(fecha.value);

    if (nombre.value == "" || nombre.value.length <= 6) {
        nombre.className = "error";
        retorno = false;
    }
    else{
        nombre.className = "sinError";
    }
    if (fecha.value == "" || fechaMod.getTime() < Date.now()) {
        fecha.className = "error";
        retorno = false;
    }
    else{
        fecha.className = "sinError";
    }

    return retorno;

}

function parseFechaTabla(fecha) {
    var fechaArray = fecha.split("/");

    return fechaArray[2] + "-" + fechaArray[1] + "-" + fechaArray[0];
}

function parseFechaApi(fecha) {
    var fechaArray = fecha.split("-");

    return fechaArray[2] + "/" + fechaArray[1] + "/" + fechaArray[0];
}