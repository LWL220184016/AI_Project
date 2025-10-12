<?php
// // File: data-endpoint.php
// header('Access-Control-Allow-Origin: *'); // Allows any origin
// header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE'); // Allows certain methods

// // Set the header to output JSON
// header('Content-Type: application/json');

// // Create some data
// $data = [
//     'message' => 'Hello, world!',
// ];

// // Output the data as JSON
// echo json_encode($data);

// ------------ test receive data from client(success) ------------

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $rawData = file_get_contents('php://input'); // Get the raw POST data
    $data = json_decode($rawData, true);

    if (empty($data)){
        echo "test result: ";
        throw new Exception("No data received.");
    }

    echo json_encode($data);
    return;
} else {
    throw new Exception("Not a post object.");
}

?>