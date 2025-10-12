<?php
    $host = "mysqldb";
    $user = "user1";
    $password = "user1pw";
    $database = "mydb";
    $conn = mysqli_connect($host, $user, $password, $database) or die(mysqli_connect_error());

    // select
    function return_sql($sql, $params, $conn) {
        $stmt = mysqli_prepare($conn, $sql);
        $types = str_repeat('s', count($params)); // 创建一个由 's' 组成的字符串，长度等于参数的数量
        mysqli_stmt_bind_param($stmt, $types, ...$params); // 使用可变参数来传递数组的值
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        mysqli_stmt_free_result($stmt); // 释放结果集
        mysqli_stmt_close($stmt);
        return $result;
    }

    // insert, update, delete
    function no_return_sql($sql, $params, $conn) {
        $stmt = mysqli_prepare($conn, $sql);
        $types = str_repeat('s', count($params)); // 创建一个由 's' 组成的字符串，长度等于参数的数量
        mysqli_stmt_bind_param($stmt, $types, ...$params); // 使用可变参数来传递数组的值
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
    }

    function insert() {
        
    }
?>
