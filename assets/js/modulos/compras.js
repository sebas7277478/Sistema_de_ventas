const tblNuevaCompra = document.querySelector('#tblNuevaCompra tbody');
const serie = document.querySelector('#serie');
//proveedores
const telefonoProveedor = document.querySelector('#telefonoProveedor');
const direccionProveedor = document.querySelector('#direccionProveedor');
const idProveedor = document.querySelector('#idProveedor');
const errorProveedor = document.querySelector('#errorProveedor');

document.addEventListener('DOMContentLoaded', function () {
    //autocomplete proveedorres
    $("#buscarProveedor").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: base_url + 'proveedor/buscar',
                dataType: "json",
                data: {
                    term: request.term
                },
                success: function (data) {
                    response(data);
                    if (data.length > 0) {
                        errorProveedor.textContent = '';
                    } else {
                        errorProveedor.textContent = 'EL PROVEEDOR NO EXISTE';
                    }
                }
            });
        },
        minLength: 2,
        select: function (event, ui) {
            telefonoProveedor.value = ui.item.telefono;
            direccionProveedor.innerHTML = ui.item.direccion;
            idProveedor.value = ui.item.id;
            serie.focus();
        }
    });

    //cargar datos
    mostrarProducto();

    //completar compra
    btnAccion.addEventListener('click', function () {
        const filas = document.querySelectorAll('#tblNuevaCompra tr').length;
        if (filas < 2) {
            alertaPersonalizada('warning', 'AGREGAR PRODUCTOS AL CARRITO');
            return;
        } else if (idProveedor.value == '' &&
            telefonoProveedor.value == '') {
            alertaPersonalizada('warning', 'EL PROVEEDOR ES REQUERIDO');
            return;
        } else if (serie.value == '') {
            alertaPersonalizada('warning', 'LA SERIE ES REQUERIDA');
            return;
        } else {
            const url = base_url + 'compras/registrarCompra';
            //hacer una instancia del objeto XMLHttpRequest
            const http = new XMLHttpRequest();
            // abrir una conexion - POST - GET
            http.open('POST', url, true);
            //enviar datos
            http.send(JSON.stringify({
                productos: listaCarrito,
                idProveedor: idProveedor.value,
                serie: serie.value,
            }));
            // verificar estados 
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    console.log(this.responseText);
                    alertaPersonalizada(res.type, res.msg);
                    if (res.type == 'success') {
                        localStorage.removeItem(nombrekey);
                        setTimeout(() => {
                            Swal.fire({
                                title: 'Desea Generar Reporte?',
                                showDenyButton: true,
                                showCancelButton: true,
                                confirmButtonText: 'Ticked',
                                denyButtonText: `Factura`,
                            }).then((result) => {
                                /* Read more about isConfirmed, isDenied below */
                                if (result.isConfirmed) {
                                    const ruta = base_url + 'compras/reporte/ticked/' + res.idCompra;
                                    window.open(ruta, '_blank');
                                } else if (result.isDenied) {
                                    const ruta = base_url + 'compras/reporte/factura/' + res.idCompra;
                                    window.open(ruta, '_blank');
                                }
                                window.location.reload();
                            })
                        }, 2000);
                    }
                }
            }
        }
    })
    //mostrar historial
    //cargar datos con el plugin datatables
    tblHistorial = $('#tblHistorial').DataTable({
        ajax: {
            url: base_url + 'compras/listar',
            dataSrc: ''
        },
        columns: [
            { data: 'fecha' },
            { data: 'hora' },
            { data: 'total' },
            { data: 'nombre' },
            { data: 'serie' },
            { data: 'acciones' }
        ],
        language: {
            url: base_url + 'assets/js/espanol.json'
        },
        dom,
        buttons,
        responsive: true,
        order: [[0, 'desc']],
    });
})

//cargar Productos
function mostrarProducto() {
    if (localStorage.getItem(nombrekey) != null) {
        const url = base_url + 'productos/mostrarDatos/';
        //hacer una instancia del objeto XMLHttpRequest
        const http = new XMLHttpRequest();
        // abrir una conexion - POST - GET
        http.open('POST', url, true);
        //enviar datos
        http.send(JSON.stringify(listaCarrito));
        // verificar estados 
        http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                const res = JSON.parse(this.responseText);
                let html = '';
                if (res.productos.length > 0) {
                    res.productos.forEach(producto => {
                        html += `<tr>
                            <td> ${producto.nombre} </td>
                            <td> ${producto.precio_compra} </td>
                            <td width="100">
                            <input type="number" class="form-control inputCantidad" data-id="${producto.id}" type="text" value="${producto.cantidad}" placeholder="Cantidad">
                            </td>
                            <td> ${producto.subTotalCompra} </td>
                            <td><button class="btn btn-danger btnEliminar" data-id="${producto.id}" type="button"><i class="fas fa-trash"></i></button></td>
                            </tr>`;
                    });
                    tblNuevaCompra.innerHTML = html;
                    totalPagar.value = res.totalCompra;
                    btnEliminarProducto();
                    agregarCantidad();
                } else {
                    tblNuevaCompra.innerHTML = `<tr>
                    <td colspan='4' class="text-center">CARRITO VACIO</td>
                </tr>`;
                }
            }
        }
    } else {
        tblNuevaCompra.innerHTML = `<tr>
            <td colspan='4' class="text-center">CARRITO VACIO</td>
        </tr>`;
    }
}

function verReporte(idCompra) {
    Swal.fire({
        title: 'Desea Generar Reporte?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Ticked',
        denyButtonText: `Factura`,
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            const ruta = base_url + 'compras/reporte/ticked/' + idCompra;
            window.open(ruta, '_blank');
        } else if (result.isDenied) {
            const ruta = base_url + 'compras/reporte/factura/' + idCompra;
            window.open(ruta, '_blank');
        }
    })
}

function anularCompra(idCompra) {
    Swal.fire({
        title: 'Esta seguro de anular la compra?',
        text: "EL stock de los productos cambiara",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'si, Anular!'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + 'compras/anular/' + idCompra;
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
                    alertaPersonalizada(res.type, res.msg);
                    if (res.type == 'success') {
                        tblHistorial.ajax.reload();
                    }
                }
            }
        }
    })
}