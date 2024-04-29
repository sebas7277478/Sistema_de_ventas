<?php include_once 'views/templates/header.php'; ?>

<div class="error-404 d-flex align-items-center justify-content-center">
    <div class="container">
        <div class="card py-5">
            <div class="row g-0">
                <div class="col col-xl-5">
                    <div class="card-body p-4">
                        <h4 class="font-weight-bold display-4">No cuenta con Permisos</h4>
                        <p>You have reached the edge of the universe.
                            <br>The page you requested could not be found.
                            <br>Dont'worry and return to the previous page.
                        </p>
                        <div class="mt-5"> <a href="<?php echo BASE_URL . 'admin'; ?>"
                                class="btn btn-primary btn-lg px-md-5 radius-30">Regresar</a>
                        </div>
                    </div>
                </div>
                <div class="col-xl-7">
                    <img src="https://cdn.searchenginejournal.com/wp-content/uploads/2019/03/shutterstock_1338315902.png"
                        class="img-fluid" alt="">
                </div>
            </div>
            <!--end row-->
        </div>
    </div>
</div>
<div class="bg-white p-3 fixed-bottom border-top shadow">
    <div class="d-flex align-items-center justify-content-between flex-wrap">
        <ul class="list-inline mb-0">
            <li class="list-inline-item">Follow Us :</li>
            <li class="list-inline-item"><a href="javascript:;"><i class='bx bxl-facebook me-1'></i>Facebook</a>
            </li>
            <li class="list-inline-item"><a href="javascript:;"><i class='bx bxl-twitter me-1'></i>Twitter</a>
            </li>
            <li class="list-inline-item"><a href="javascript:;"><i class='bx bxl-google me-1'></i>Google</a>
            </li>
        </ul>
        <p class="mb-0">Copyright © 2021. All right reserved.</p>
    </div>
</div>

<?php include_once 'views/templates/footer.php'; ?>