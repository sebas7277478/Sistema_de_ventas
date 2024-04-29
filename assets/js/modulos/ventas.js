const tblNuevaVenta = document.querySelector('#tblNuevaVenta tbody');

const idCliente = document.querySelector('#idCliente');
const telefonoCliente = document.querySelector('#telefonoCliente');
const direccionCliente = document.querySelector('#direccionCliente');
const errorCliente = document.querySelector('#errorCliente');

const descuento = document.querySelector('#descuento');
const metodo = document.querySelector('#metodo');
const impresion_directa = document.querySelector('#impresion_directa');

const pagar_con = document.querySelector('#pagar_con');
const cambio = document.querySelector('#cambio');
const totalPagarHidden = document.querySelector('#totalPagarHidden');

document.addEventListener('DOMContentLoaded', function () {
    //cargar productos del localStorage
    mostrarProducto();

    //autocomplete clientes
    $("#buscarCliente").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: base_url + 'clientes/buscar',
                dataType: "json",
                data: {
                    term: request.term
                },
                success: function (data) {
                    response(data);
                    if (data.length > 0) {
                        errorCliente.textContent = '';
                    } else {
                        errorCliente.textContent = 'EL CLIENTE NO EXISTE';
                    }
                }
            });
        },
        minLength: 2,
        select: function (event, ui) {
            telefonoCliente.value = ui.item.telefono;
            direccionCliente.innerHTML = ui.item.direccion;
            idCliente.value = ui.item.id;
        }
    });

    //completar venta
    btnAccion.addEventListener('click', function () {
        const filas = document.querySelectorAll('#tblNuevaVenta tr').length;
        if (filas < 2) {
            alertaPersonalizada('warning', 'CARRITO VACIO');
            return;
        } else if (metodo.value == '') {
            alertaPersonalizada('warning', 'EL METODO ES REQUERIDO');
            return;
        } else {
            const url = base_url + 'ventas/registrarVenta';
            //hacer una instancia del objeto XMLHttpRequest
            const http = new XMLHttpRequest();
            // abrir una conexion - POST - GET
            http.open('POST', url, true);
            //enviar datos
            http.send(JSON.stringify({
                productos: listaCarrito,
                idCliente: idCliente.value,
                metodo: metodo.value,
                descuento: descuento.value,
                pago: pagar_con.value,
                impresion: impresion_directa.checked
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
                                    const ruta = base_url + 'ventas/reporte/ticked/' + res.idVenta;
                                    window.open(ruta, '_blank');
                                } else if (result.isDenied) {
                                    const ruta = base_url + 'ventas/reporte/factura/' + res.idVenta;
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

    //cargar datos con el plugin datatables
    tblHistorial = $('#tblHistorial').DataTable({
        ajax: {
            url: base_url + 'ventas/listar',
            dataSrc: ''
        },
        columns: [
            { data: 'fecha' },
            { data: 'hora' },
            { data: 'total' },
            { data: 'nombre' },
            { data: 'serie' },
            { data: 'metodo' },
            { data: 'acciones' }
        ],
        language: {
            url: base_url + 'assets/js/espanol.json'
        },
        dom,
        buttons,
        responsive: true,
        order: [[4, 'desc']],
    });

    //calcular cambio
    pagar_con.addEventListener('keyup', function(e) {             
        if(totalPagar.value != ''){
            let totalDescuento = descuento.value != '' ? descuento.value : 0;
            let totalCambio = pagar_con.value != '' ? parseFloat(e.target.value) - (parseFloat(totalPagarHidden.value) - parseFloat(totalDescuento)) : 0;            
            cambio.value = totalCambio.toFixed(2);
        }
    })

    //calcular descuento
    descuento.addEventListener('keyup', function(e) {             
        if(totalPagar.value != ''){
            let nuevoTotal = descuento.value != '' ? parseFloat(totalPagarHidden.value) - parseFloat(e.target.value) :parseFloat(totalPagarHidden.value);
            totalPagar.value = nuevoTotal.toFixed(2);
            let nuevoCambio = parseFloat(pagar_con.value) - parseFloat(nuevoTotal);
            cambio.value = nuevoCambio.toFixed(2);
        }
    })
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
                            <td> ${producto.precio_venta} </td>
                            <td width="100">
                            <input type="number" class="form-control inputCantidad" data-id="${producto.id}" type="text" value="${producto.cantidad}" placeholder="Cantidad">
                            </td>
                            <td> ${producto.subTotalVenta} </td>
                            <td><button class="btn btn-danger btnEliminar" data-id="${producto.id}" type="button"><i class="fas fa-trash"></i></button></td>
                            </tr>`;
                    });
                    tblNuevaVenta.innerHTML = html;
                    totalPagar.value = res.totalVenta;
                    totalPagarHidden.value = res.totalVentaSD;
                    btnEliminarProducto();
                    agregarCantidad();
                } else {
                    tblNuevaVenta.innerHTML = `<tr>
                    <td colspan='4' class="text-center">CARRITO VACIO</td>
                </tr>`;
                }
            }
        }
    } else {
        tblNuevaVenta.innerHTML = `<tr>
            <td colspan='4' class="text-center">CARRITO VACIO</td>
        </tr>`;
    }
}

function verReporte(idVenta) {
    Swal.fire({
        title: 'Desea Generar Reporte?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Ticked',
        denyButtonText: `Factura`,
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            const ruta = base_url + 'ventas/reporte/ticked/' + idVenta;
            window.open(ruta, '_blank');
        } else if (result.isDenied) {
            const ruta = base_url + 'ventas/reporte/factura/' + idVenta;
            window.open(ruta, '_blank');
        }
    })
}

function anularVenta(idVenta) {
    Swal.fire({
        title: 'Esta seguro de anular la venta?',
        text: "EL stock de los productos cambiara",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'si, Anular!'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + 'ventas/anular/' + idVenta;
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