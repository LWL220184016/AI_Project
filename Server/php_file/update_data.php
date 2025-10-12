<?php
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        require_once("conn2.php");
        require_once("login_register/check_login_state.php");
        require_once("state.php");

        if (empty($_POST)){
            throw new Exception("No data received.");
        } else if (!isset($_POST['from'])){
            throw new Exception("What your purpose? (nr = new recipe, nu = new user)");
        } else {
            $data = $_POST;
        }
        $data["file"] = array();
        foreach ($_FILES as $file) {
            if (!empty($file['name'])) {
                $data["file"][] = $_FILES;
                break;
            }
        }

        if ($_POST['from'] === 'fp') { // forget_password
            if ($_POST['password1'] == $_POST['password2']) {
                require_once("objects/user.php");
                $r = new User($pdo);
                $message = $r->forget_password($data);
                // echo $message; // show message in for debug
                password_modify_success();
            } else {
                throw new Exception("Password1 is not same with Password2.");
            }
        } else {
            throw new Exception("Not accepted object.");
        }

    }
?>