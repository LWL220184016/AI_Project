<?php
    // 使用 URL 參數來傳遞狀態消息。

    function login_failed() {
        header('Location: login.php?state=login_failed');
        exit();
    }

    function userName_exists() {
        header('Location: login_register/register.php?state=UNE');
        exit();
    }
    
    function register_success() {
        header('Location: login_register/login.php?state=register_success');
        exit();
    }
    
    function password_modify_success() {
        header('Location: login_register/login.php?state=PMS');
        exit();
    }

    function password_exists() {
        header('Location: forget_pw.php?state=PE');
        exit();
    }
?>