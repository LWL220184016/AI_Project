<?php
    header('Access-Control-Allow-Origin: *'); // Allows any origin
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE'); // Allows certain methods

    require_once("conn2.php");

    function get_weight_unit_options() {    
        $pdo = $GLOBALS['pdo'];
        $sql = "SELECT unitName FROM weight_Unit;";
        $result = $pdo->query($sql);
        $options = "";
        while($row = $result->fetch()) {
            $options .= "<option value='" . $row["unitName"]. "'>" . $row["unitName"]. "</option>";
        }
        return json_encode($options);
    }

    if (isset($_GET['function']) && function_exists($_GET['function'])) {
        echo get_weight_unit_options();
    }
?>
