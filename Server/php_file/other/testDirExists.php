<?php 
    # Check if a directory that php-fpm has permission to write to exists
            # could not reach the dir not under php_file in usual way

    $dir = '../';
    if (is_dir($dir)) {
        echo 'The directory (' . $dir . ') exists';
    } else {
        echo 'The directory (' . $dir . ') does not exist';
    }
?>