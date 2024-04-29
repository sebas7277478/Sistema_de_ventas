let tblClientes, editorDireccion;

const formulario = document.querySelector('#formulario');
const btnAccion = document.querySelector('#btnAccion');
const btnNuevo = document.querySelector('#btnNuevo');

const documento = document.querySelector('#documento');
const num_documento = document.querySelector('#num_documento');
const nombre = document.querySelector('#nombre');
const telefono = document.querySelector('#telefono');
const correo = document.querySelector('#correo');
const direccion = document.querySelector('#direccion');
const id = document.querySelector('#id');

const errorDocumento = document.querySelector('#errorDocumento');
const errorNum_documento = document.querySelector('#errorNum_documento');
const errorNombre = document.querySelector('#errorNombre');
const errorTelefono = document.querySelector('#errorTelefono');
const errorDireccion = document.querySelector('#errorDireccion');

document.addEventListener('DOMContentLoaded', function () {
    //cargar datos con el plugin datatables
    tblClientes = $('#tblClientes').DataTable({
        ajax: {
            url: base_url + 'clientes/listar',
            dataSrc: ''
        },
        columns: [
            { data: 'documento' },
            { data: 'num_documento' },
            { data: 'nombre' },
            { data: 'telefono' },
            { data: 'correo' },
            { data: 'direccion' },
            { data: 'acciones' }
        ],
        language: {
            url: base_url + 'assets/js/espanol.json'
        },
        dom,
        buttons,
        responsive: true,
        order: [[0, 'asc']]
    });
    // inicializar un editor 
    ClassicEditor
        .create(document.querySelector('#direccion'), {
            toolbar: {
                items: [
                    'selectAll', '|',
                    'heading', '|',
                    'bold', 'italic',
                    'outdent', 'indent', '|',
                    'undo', 'redo',
                    'alignment', '|',
                    'link', 'blockQuote', 'insertTable', 'mediaEmbed',
                ],
                shouldNotGroupWhenFull: true
            },
        })
        .then(editor => {
            editorDireccion = editor
        })
        .catch(error => {
            console.error(error);
        });
    //limpiar campos
    btnNuevo.addEventListener('click', function () {
        id.value = '';
        btnAccion.textContent = 'Registrar';
        editorDireccion.setData('');
        formulario.reset();
        editorDireccion.setData('');
        limpiarCampos();
    })
    //registrar clientes
    formulario.addEventListener('submit', function (e) {
        e.preventDefault();
        limpiarCampos();
        if (documento.value == '') {
            errorDocumento.textContent = 'EL TIPO DE DOCUMENTO ES REQUERIDO';
        } else if (num_documento.value == '') {
            errorNum_documento.textContent = 'EL N° DE DOCUMENTO ES REQUERIDO';
        } else if (nombre.value == '') {
            errorNombre.textContent = 'EL NOMBRE ES REQUERIDO';
        } else if (telefono.value == '') {
            errorTelefono.textContent = 'EL TELEFONO ES REQUERIDO';
        } else if (direccion.value == '') {
            errorDireccion.textContent = 'LA DIRECCIÓN ES REQUERIDA';
        } else {
            const url = base_url + 'clientes/registrar';
            insertarRegistros(url, this, tblClientes, btnAccion, false);
            editorDireccion.setData('');
        }
    })
})

function eliminarCliente(idCliente) {
    const url = base_url + 'clientes/eliminar/' + idCliente;
    eliminarRegistros(url, tblClientes);
}
function editarCliente(idCliente) {
    limpiarCampos();
    const url = base_url + 'clientes/editar/' + idCliente;
    //hacer una instancia del objeto XMLHttpRequest
    const http = new XMLHttpRequest();
    // abrir una conexion - POST - GET
    http.open('GET', url, true);
    //enviar datos
    http.send();
    // verificar estados 
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            id.value = res.id;
            documento.value = res.documento;
            num_documento.value = res.num_documento;
            nombre.value = res.nombre;
            telefono.value = res.telefono;
            correo.value = res.correo;
            editorDireccion.setData(res.direccion);
            btnAccion.textContent = 'Actualizar';
            firstTab.show()
        }
    }
}

function limpiarCampos() {
    errorDocumento.textContent = '';
    errorNum_documento.textContent = '';
    errorNombre.textContent = '';
    errorTelefono.textContent = '';
    errorDireccion.textContent = '';
}