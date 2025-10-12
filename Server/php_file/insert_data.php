<?php
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        require_once("conn2.php");
        require_once("state.php");

        $rawData = file_get_contents('php://input'); // Get the raw POST data
        $data = json_decode($rawData, true);

        $data["file"] = array();
        foreach ($_FILES as $file) {
            if (!empty($file['name'])) {
                $data["file"][] = $_FILES;
                break;
            }
        }

        if ($data['from'] === 'nr') { // new recipe
            if (isset($data['recipeTitle']) && !empty($data['recipeTitle'])) {
                require_once("objects/recipe.php");
                $r = new Recipe($pdo);
                $message = $r->create($username, $data);
                // echo $message; // show message in for debug
                return "Message: " . $message;
            } else {
                throw new Exception("Recipe title is required.");
            }
        } else if ($data['from'] === 'nu'){ // new user
            require_once("objects/user.php");
            $u = new User($pdo);
            $message = $u->create($data);
            echo $message;
            return "Message: " . $message;
        } else {
            throw new Exception("Not accepted object.");
        }
        return "nothing run";
    }   
?>