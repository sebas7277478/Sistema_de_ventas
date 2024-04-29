let tblInventario;
const btnBuscar = document.querySelector('#btnBuscar');
const btnReporte = document.querySelector('#btnReporte');
const btnAjuste = document.querySelector('#btnAjuste');
const btnProcesas = document.querySelector('#btnProcesas');
const mes = document.querySelector('#mes');

const modalAjuste = new bootstrap.Modal('#modalAjuste');

const buscarCodigoAjuste = document.querySelector('#buscarCodigoAjuste');
const buscarNombreAjuste = document.querySelector('#buscarNombreAjuste');
const barcodeAjuste = document.querySelector('#barcodeAjuste');
const nombreAjuste = document.querySelector('#nombreAjuste');
const containerCodigoAjuste = document.querySelector('#containerCodigoAjuste');
const containerNombreAjuste = document.querySelector('#containerNombreAjuste');

const cantidadAjuste = document.querySelector('#cantidadAjuste');
const idProductoAjuste = document.querySelector('#idProductoAjuste');

//*****/ kardex /*****//

const inputBuscarCodigo = document.querySelector('#buscarProductoCodigo');
const inputBuscarNombre = document.querySelector('#buscarProductoNombre');
const barcode = document.querySelector('#barcode');
const nombre = document.querySelector('#nombre');
const containerCodigo = document.querySelector('#containerCodigo');
const containerNombre = document.querySelector('#containerNombre');
const errorBusquedaAjuste = document.querySelector('#errorBusquedaAjuste');
const errorBusqueda = document.querySelector('#errorBusqueda');

document.addEventListener('DOMContentLoaded', function () {
    //cargar todos los datos
    cargarInventario(base_url + 'inventarios/listarMovimientos');

    //filtro
    btnBuscar.addEventListener('click', function () {
        if (mes.value == '') {
            alertaPersonalizada('warning', 'SELECCIONA EL MES');
        } else {
            const url = base_url + 'inventarios/listarMovimientos/' + mes.value;
            cargarInventario(url);
        }
    });

    //reporte
    btnReporte.addEventListener('click', function () {
        if (mes.value == '') {
            window.open(base_url + 'inventarios/reporte', '_blank');
        } else {
            const url = base_url + 'inventarios/reporte/' + mes.value;
            window.open(url, '_blank');
        }
    });
    //modal ajuste de inventario 
    btnAjuste.addEventListener('click', function () {
        idProductoAjuste.value = '';
        buscarCodigoAjuste.value = '';
        buscarNombreAjuste.value = '';
        cantidadAjuste.value = '';
        errorBusquedaAjuste.value = '';
        modalAjuste.show();
    })

    //mostrar input para la busqueda por nombre
    nombreAjuste.addEventListener('click', function () {
        containerCodigoAjuste.classList.add('d-none');
        containerNombreAjuste.classList.remove('d-none');
        buscarNombreAjuste.value = '';
        idProductoAjuste.value = '';
        errorBusquedaAjuste.value = '';
        buscarNombreAjuste.focus();
    })
    //mostrar input para la busqueda por codigo
    barcodeAjuste.addEventListener('click', function () {
        containerNombreAjuste.classList.add('d-none');
        containerCodigoAjuste.classList.remove('d-none');
        buscarCodigoAjuste.value = '';
        idProductoAjuste.value = '';
        buscarCodigoAjuste.focus();
    })

    buscarCodigoAjuste.addEventListener('keyup', function (e) {
        console.log(barcodeAjuste.checked);
        if (e.keyCode === 13) {
            ProductoPorCodigo(e.target.value);
        }
        return;
    })

    //autocomplete productos
    $("#buscarNombreAjuste").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: base_url + 'productos/buscarPorNombre',
                dataType: "json",
                data: {
                    term: request.term
                },
                success: function (data) {
                    response(data);
                    if(data.length > 0){
                        errorBusquedaAjuste.textContent = '';                        
                    } else {
                        errorBusquedaAjuste.textContent = 'NO EXISTE EL PRODUCTO'; 
                    }
                }
            });
        },
        minLength: 2,
        select: function (event, ui) {
            idProductoAjuste.value = ui.item.id;
            cantidadAjuste.focus();
        }
    });

    //procesar ajuste de inventario
    btnProcesas.addEventListener('click', function () {
        if (idProductoAjuste.value == '' && buscarNombreAjuste.value == '') {
            alertaPersonalizada('warning', 'EL PRODUCTO ES REQUERIDO');
        } else if (cantidadAjuste.value == '') {
            alertaPersonalizada('warning', 'LA CANTIDAD ES REQUERIDA');
        } else {
            const url = base_url + 'inventarios/procesarAjuste/';
            //hacer una instancia del objeto XMLHttpRequest
            const http = new XMLHttpRequest();
            // abrir una conexion - POST - GET
            http.open('POST', url, true);
            //enviar datos
            http.send(JSON.stringify({
                idProducto: idProductoAjuste.value,
                cantidad: cantidadAjuste.value
            }));
            // verificar estados 
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    console.log(this.responseText);
                    const res = JSON.parse(this.responseText);
                    alertaPersonalizada(res.type, res.msg);
                    if (res.type == 'success') {
                        modalAjuste.hide();
                        cargarInventario(base_url + 'inventarios/listarMovimientos');
                    }
                }
            }
        }
    })

    //*****/ kardex /*****//

    //mostrar input para la busqueda por nombre
    nombre.addEventListener('click', function () {
        containerCodigo.classList.add('d-none');
        containerNombre.classList.remove('d-none');
        inputBuscarNombre.value = '';
        errorBusqueda.value = '';
        inputBuscarNombre.focus();
    })
    //mostrar input para la busqueda por codigo
    barcode.addEventListener('click', function () {
        containerNombre.classList.add('d-none');
        containerCodigo.classList.remove('d-none');
        inputBuscarCodigo.value = '';
        errorBusqueda.value = '';
        inputBuscarCodigo.focus();
    })
    inputBuscarCodigo.addEventListener('keyup', function (e) {
        console.log(barcode.checked);
        if (e.keyCode === 13) {
            const url = base_url + 'productos/buscarPorCodigo/' + e.target.value;
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
                    if (res.estado) {
                        reporteKardex(res.datos.id);
                    } else {
                        alertaPersonalizada('warning', 'CODIGO NO EXISTE');
                    }
                }
            }
        }
        return;
    })

    //autocomplete productos
    $("#buscarProductoNombre").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: base_url + 'productos/buscarPorNombre',
                dataType: "json",
                data: {
                    term: request.term
                },
                success: function (data) {
                    response(data);
                    if(data.length > 0){
                        errorBusqueda.textContent = '';                        
                    } else {
                        errorBusqueda.textContent = 'NO EXISTE EL PRODUCTO'; 
                    }
                }
            });
        },
        minLength: 2,
        select: function (event, ui) {
            reporteKardex(ui.item.id);
        }
    });
})

function cargarInventario(ruta) {
    //cargar datos con el plugin datatables
    tblInventario = $('#tblInventario').DataTable({
        ajax: {
            url: ruta,
            dataSrc: ''
        },
        columns: [
            { data: 'descripcion' },
            { data: 'movimiento' },
            { data: 'fecha' },
            { data: 'cantidad' }
        ],
        language: {
            url: base_url + 'assets/js/espanol.json'
        },
        dom,
        buttons,
        responsive: true,
        destroy: true,
        order: [[2, 'desc']]
    });
}

function ProductoPorCodigo(valor) {
    const url = base_url + 'productos/buscarPorCodigo/' + valor;
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
            if (res.estado) {
                idProductoAjuste.value = res.datos.id;
                buscarCodigoAjuste.value = res.datos.descripcion;
                cantidadAjuste.focus();
            } else {
                alertaPersonalizada('warning', 'CODIGO NO EXISTE');
            }
        }
    }
}

function reporteKardex(idProducto) {
    let timerInterval
    Swal.fire({
        title: 'Entradas y Salidas',
        html: 'Generando Reporte <b></b> milliseconds.',
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading()
            const b = Swal.getHtmlContainer().querySelector('b')
            timerInterval = setInterval(() => {
                b.textContent = Swal.getTimerLeft()
            }, 100)
        },
        willClose: () => {
            clearInterval(timerInterval)
        }
    }).then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === Swal.DismissReason.timer) {
            const ruta = base_url + 'inventarios/kardex/' + idProducto;
            window.open(ruta, '_blank');
        }
    })
}