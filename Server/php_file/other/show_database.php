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
                <a href="" class="nav-button">Insert Item</a>
            </div>
            <div class="nav-button-container">
                <a href="" class="nav-button">Report</a>
            </div>
            <div class="nav-button-container">
                <a href="" class="nav-button">Information</a>
            </div>
            <br>
        </nav>
        <div id="main" style="display: flex;">
            <?php
                require_once("../conn2.php");
                $sql = "SHOW TABLES;";
                $result = $pdo->query($sql);

                if ($result) {
                    while ($row = $result->fetch(PDO::FETCH_NUM)) {
                        echo "<div>";
                        $tableName = $row[0];
                        echo "<h2>" . $tableName . "</h2>";

                        $sql = "SELECT * FROM $tableName";
                        $innerResult = $pdo->query($sql);
                        if ($innerResult) {
                            $fields = [];
                            $columnCount = $innerResult->columnCount();
                            for ($i = 0; $i < $columnCount; $i++) {
                                $meta = $innerResult->getColumnMeta($i);
                                $fields[] = $meta['name'];
                            }
                            echo "<table>";
                            echo "<thead><tr>";
                            foreach ($fields as $field) {
                                echo "<th>" . $field . "</th>";
                            }
                            echo "</tr></thead>";
                            echo "<tbody>";
                            while ($row = $innerResult->fetch(PDO::FETCH_NUM)) {
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
                        echo "</div>";
                    }
                }
            ?>
        </div>
    </div>

</body>
</html>