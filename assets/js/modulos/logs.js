const btnLimpiar = document.querySelector('#btnLimpiar');
let tbl;

document.addEventListener('DOMContentLoaded', function () {
    tbl = $('#tblLogs').DataTable({
        ajax: {
            url: base_url + 'admin/listarLogs',
            dataSrc: ''
        },
        columns: [
            { data: 'evento' },
            { data: 'ip' },
            { data: 'detalle' },
            { data: 'fecha' },
        ],
        language: {
            url: base_url + 'assets/js/espanol.json'
        },
        dom,
        buttons,
        responsive: true,
        order: [[0, 'asc']]
    });

    btnLimpiar.addEventListener('click', function () {
        Swal.fire({
            title: 'Esta seguro de limpiar?',
            text: "Se eliminaran de forma permanente todos los registros de acceso!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'si, eliminar!'
        }).then((result) => {
            if (result.isConfirmed) {
                const url = base_url + 'admin/limpiarDatos';
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
                        Swal.fire({
                            toast: true,
                            position: 'top-right',
                            icon: res.type,
                            title: res.msg,
                            showConfirmButton: false,
                            timer: 2000
                        })
                        if (res.type == 'success') {
                            tbl.ajax.reload();
                        }
                    }
                }
            }
        })
    })
})