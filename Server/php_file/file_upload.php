<?php 
    require_once("conn2.php");
    require_once("login_register/check_login_state.php");

    function file_upload($pdo, $recipeID, $fileData) {
        $message = "";
        // check the array structure of fileData for debug
        // if (!isset($fileData['name']) || empty($fileData['name'])) {
        //     var_dump($fileData);
        //     throw new Exception("No file uploaded.");
        // }

        foreach ($fileData as $file) {
            $fileName = $file["recipeImage"]['name'];
            $fileType = $file["recipeImage"]['type'];
            $fileTmpName = $file["recipeImage"]['tmp_name'];
            $fileError = $file["recipeImage"]['error'];
            $fileSize = $file["recipeImage"]['size'];
        
            // Now you can use these variables

            $target_dir = __DIR__ . '/' . "uploads/recipeImage/";
            $target_file = $target_dir . basename($fileName);
            $imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));

            // Check if image file is a actual image or fake image
            $check = getimagesize($fileTmpName);
            if($check !== false) {
                $message .= "File is an image - " . $check["mime"] . ", ";
            } else {
                throw new Exception("File is not an image.");
            }

            // Check if directory exists and is writable, if not create it
            if (!is_dir($target_dir) || !is_writable($target_dir)) {
                mkdir($target_dir, 0777, true);
            }

            // Check if file already exists
            if (file_exists($target_file)) {
                throw new Exception("Sorry, file already exists.");
            }

            // Check file size
            if ($fileSize > 500000) {
                throw new Exception("Sorry, your file is too large.");
            }

            // Allow certain file formats
            if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg") {
                throw new Exception("Sorry, only JPG, JPEG & PNG files are allowed.");
            }

            if (!move_uploaded_file($fileTmpName, $target_file)) {
                throw new Exception("Sorry, there was an error uploading your file.");
            }

            $sql = "UPDATE recipe SET imagePath = ? WHERE recipeID = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([basename($fileName), $recipeID]);
                
            return $message . "recipeID is $recipeID\nThe file ". basename($fileName). " has been uploaded.<br>";
        }
    }
?>