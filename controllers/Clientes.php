<?php

class Clientes extends Controller
{
    public function __construct()
    {
        parent::__construct();
        session_start();
        if (empty($_SESSION['id_usuario'])) {
            header('Location: ' . BASE_URL);
            exit;
        }
    }
    public function index()
    {
        $data['title'] = 'Clientes';
        $data['script'] = 'clientes.js';
        $this->views->getView('clientes', 'index', $data);
    }
    public function listar()
    {
        $data = $this->model->getClientes(1);
        for ($i = 0; $i < count($data); $i++) {
            $data[$i]['acciones'] = '<div>
            <button class="btn btn-danger" type="button" onclick="eliminarCliente(' . $data[$i]['id'] . ')"><i class="fas fa-trash"></i></button>
            <button class="btn btn-info" type="button" onclick="editarCliente(' . $data[$i]['id'] . ')"><i class="fas fa-edit"></i></button>
            </div>';
        }
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        die();
    }
    public function registrar()
    {
        if (isset($_POST['documento']) && isset($_POST['num_documento'])) {
            $id = strClean($_POST['id']);
            $documento = strClean($_POST['documento']);
            $num_documento = strClean($_POST['num_documento']);
            $nombre = strClean($_POST['nombre']);
            $telefono = strClean($_POST['telefono']);
            $correo = (empty($_POST['correo'])) ? null : strClean($_POST['correo']);
            $direccion = strClean($_POST['direccion']);
            if (empty($documento)) {
                $res = array('msg' => 'EL TIPO DE DOCUMENTO ES REQUERIDO', 'type' => 'warning');
            } else if (empty($num_documento)) {
                $res = array('msg' => 'EL N° DE DOCUMENTO ES REQUERIDO', 'type' => 'warning');
            } else if (empty($nombre)) {
                $res = array('msg' => 'EL NOMBRE ES REQUERIDO', 'type' => 'warning');
            } else if (empty($telefono)) {
                $res = array('msg' => 'EL TELEFONO ES REQUERIDO', 'type' => 'warning');
            } else if (empty($direccion)) {
                $res = array('msg' => 'LA DIRECCIÓN ES REQUERIDA', 'type' => 'warning');
            } else {
                if ($id == '') {
                    $verificarDocumento = $this->model->getValidar('num_documento', $num_documento, 'registrar', 0);
                    if (empty($verificarDocumento)) {
                        $verificarTelefono = $this->model->getValidar('telefono', $telefono, 'registrar', 0);
                        if (empty($verificarTelefono)) {
                            if ($correo != null) {
                                $verificarCorreo = $this->model->getValidar('correo', $correo, 'registrar', 0);
                                if (!empty($verificarCorreo)) {
                                    $res = array('msg' => 'EL CORREO DEBE SER UNICO', 'type' => 'warning');
                                    echo json_encode($res);
                                    die();
                                }
                            }
                            $data = $this->model->registrar(
                                $documento,
                                $num_documento,
                                $nombre,
                                $telefono,
                                $correo,
                                $direccion
                            );
                            if ($data > 0) {
                                $res = array('msg' => 'CLIENTE REGISTRADO', 'type' => 'success');
                            } else {
                                $res = array('msg' => 'ERROR AL REGISTRAR', 'type' => 'error');
                            }
                        } else {
                            $res = array('msg' => 'EL TELEFONO DEBE SER UNICO', 'type' => 'warning');
                        }
                    } else {
                        $res = array('msg' => 'EL DOCUMENTO DEBE SER UNICO', 'type' => 'warning');
                    }
                } else {
                    $verificarDocumento = $this->model->getValidar('num_documento', $num_documento, 'actualizar', $id);
                    if (empty($verificarDocumento)) {
                        $verificarTelefono = $this->model->getValidar('telefono', $telefono, 'actualizar', $id);
                        if (empty($verificarTelefono)) {
                            if ($correo != null) {
                                $verificarCorreo = $this->model->getValidar('correo', $correo, 'actualizar', $id);
                                if (!empty($verificarCorreo)) {
                                    $res = array('msg' => 'EL CORREO DEBE SER UNICO', 'type' => 'warning');
                                    echo json_encode($res);
                                    die();
                                }
                            }
                            $data = $this->model->actualizar(
                                $documento,
                                $num_documento,
                                $nombre,
                                $telefono,
                                $correo,
                                $direccion,
                                $id
                            );
                            if ($data > 0) {
                                $res = array('msg' => 'CLIENTE MODIFICADO', 'type' => 'success');
                            } else {
                                $res = array('msg' => 'ERROR AL MODIFICAR', 'type' => 'error');
                            }
                        } else {
                            $res = array('msg' => 'EL TELEFONO DEBE SER UNICO', 'type' => 'warning');
                        }
                    } else {
                        $res = array('msg' => 'EL DOCUMENTO DEBE SER UNICO', 'type' => 'warning');
                    }
                }
            }
        } else {
            $res = array('msg' => 'ERROR DESCONOCIDO', 'type' => 'error');
        }
        echo json_encode($res);
        die();
    }
    public function eliminar($idCliente)
    {
        if (isset($_GET) && is_numeric($idCliente)) {
            $data = $this->model->eliminar(0, $idCliente);
            if ($data > 0) {
                $res = array('msg' => 'CLIENTE DADO DE BAJA', 'type' => 'success');
            } else {
                $res = array('msg' => 'ERROR AL ELIMINAR', 'type' => 'error');
            }

        } else {
            $res = array('msg' => 'ERROR DESCONOCIDO', 'type' => 'error');
        }
        echo json_encode($res, JSON_UNESCAPED_UNICODE);
        die();
    }
    public function editar($idCliente)
    {
        $data = $this->model->editar($idCliente);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        die();
    }
    public function inactivos()
    {
        $data['title'] = 'Clientes Inactivos';
        $data['script'] = 'clientes-inactivos.js';
        $this->views->getView('clientes', 'inactivos', $data);
    }
    public function listarInactivos()
    {
        $data = $this->model->getClientes(0);
        for ($i = 0; $i < count($data); $i++) {
            $data[$i]['acciones'] = '<div>
            <button class="btn btn-danger" type="button" onclick="restaurarCliente(' . $data[$i]['id'] . ')"><i class="fas fa-check-circle"></i></button>
            </div>';
        }
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        die();
    }
    public function restaurar($idCliente)
    {
        if (isset($_GET) && is_numeric($idCliente)) {
            $data = $this->model->eliminar(1, $idCliente);
            if ($data > 0) {
                $res = array('msg' => 'CLIENTE RESTAURADO', 'type' => 'success');
            } else {
                $res = array('msg' => 'ERROR AL RESTAURAR', 'type' => 'error');
            }

        } else {
            $res = array('msg' => 'ERROR DESCONOCIDO', 'type' => 'error');
        }
        echo json_encode($res, JSON_UNESCAPED_UNICODE);
        die();
    }
    //buscar cliente para la compra
    public function buscar()
    {
        $array = array();
        $valor = strClean($_GET['term']);
        $data = $this->model->buscarPorNombre($valor);
        foreach ($data as $row) {
            $result['id'] = $row['id'];
            $result['label'] = $row['nombre'];
            $result['telefono'] = $row['telefono'];
            $result['direccion'] = $row['direccion'];
            array_push($array, $result);
        }
        echo json_encode($array, JSON_UNESCAPED_UNICODE);
        die();
    }
}

?>