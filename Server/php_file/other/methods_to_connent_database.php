<!-- This code uses PDO (PHP Data Objects) with prepared statements, which is a more 
secure way of executing SQL queries in PHP. It prevents SQL injection attacks by 
automatically escaping special characters. -->
1.
<?php 
    $stmt = $pdo->prepare("SELECT userEmail FROM `user` WHERE `userEmail` = :userEmail");
    $stmt->execute(['userEmail' => $Recipients]);
    $userEmail = $stmt->fetchColumn();

    if ($userEmail) {
        return true;
    } else {
        return false;
    }
?>


<!-- The second and third snippets use the mysqli extension. While the second snippet 
also uses prepared statements, it's more verbose and complex than the PDO version. The 
third snippet is the least secure because it directly interpolates a variable into the 
SQL query, which makes it vulnerable to SQL injection if the variable is not properly 
escaped.

In terms of efficiency, all three methods should have similar performance. The main 
difference is in their security and simplicity. PDO with prepared statements is generally 
considered the best practice for executing SQL queries in PHP. -->
2.
<?php
    $sql = "SELECT userEmail FROM `user` WHERE `userEmail` = '$Recipients'";
    $stmt = mysqli_prepare($conn, $sql);
    $types = str_repeat('s', count($params)); // 创建一个由 's' 组成的字符串，长度等于参数的数量
    mysqli_stmt_bind_param($stmt, $types, ...$params); // 使用可变参数来传递数组的值
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    mysqli_stmt_free_result($stmt); // 释放结果集
    mysqli_stmt_close($stmt);

    if (mysqli_num_rows($result) == 0) {
        return true;
    } else {
        return false;
    }
?>

3.
<?php
    $sql = "SELECT userEmail FROM `user` WHERE `userEmail` = '$Recipients'";
    $rs = mysqli_query($conn, $sql) or die(mysqli_error($conn));
    $rc = mysqli_fetch_assoc($rs);
    $username = $rc['userEmail'];
    mysqli_free_result($rs);

    if ($username == '') {
        return true;
    } else {
        return false;
    }
?>
