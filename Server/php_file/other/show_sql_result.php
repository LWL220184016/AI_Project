<?php
    session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" href="Style/SMain.css" />
    <meta charset="UTF-8">
</head>
<body>
    <header>
        <div style="display: flex;">
            <div id="header1" 
                  style="width: 600px">
                <h1>Database content</h1>
            </div>
            <div id="header2" 
                  style="display: flex; align-items: center; justify-content: space-between;">
                <table>
                    <tr>
                        <form action="show_sql_result.php" method="post">
                            <td width='110'>Input sql there:  </td>
                            <td><textarea name="sql" id="sql" style="width: 500px; height: 100px; resize: none;"></textarea></td>
                            <td><input type="submit" value="Execute SQL"></td>
                        </form>
                    </tr>
                </table>
            </div>
        </div>
    </header>
    <div id="flex-container">
        <nav>
            <div class="nav-button-container">
                <a href="show_database.php" class="nav-button">Back</a>
            </div>
            <div class="nav-button-container">
                <a href="" class="nav-button">Report</a>
            </div>
            <div class="nav-button-container">
                <a href="" class="nav-button">Information</a>
            </div>
        </nav>
        <div id="main">
            <?php
                require_once("../conn2.php");
                $sql = $_POST['sql'];
                $result = $pdo->query($sql);

                if ($result) {
                    $fields = [];
                    $columnCount = $result->columnCount();
                    for ($i = 0; $i < $columnCount; $i++) {
                        $meta = $result->getColumnMeta($i);
                        $fields[] = $meta['name'];
                    }
                    echo "<table>";
                    echo "<thead><tr>";
                    foreach ($fields as $field) {
                        echo "<th width='100px'>" . $field . "</th>";
                    }
                    echo "</tr></thead>";
                    echo "<tbody>";
                    while ($row = $result->fetch(PDO::FETCH_NUM)) {
                        echo "<tr>";
                        foreach ($row as $value) {
                            echo "<td>" . $value . "</td>";
                        }
                        echo "</tr>";
                    }
                    echo "</tbody></table>";
                } else {
                    echo "No items found.";
                }
            ?>
        </div>
    </div>

</body>
</html>