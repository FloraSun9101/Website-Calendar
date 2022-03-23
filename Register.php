<?php
header("Content-Type: application/json");

$json_str = file_get_contents("php://input");
$json_obj = json_decode($json_str, true);

$username = $json_obj["username"];
$password = $json_obj["password"];

require "database.php";
$stmt = $mysqli->prepare("INSERT INTO users (username, password) values (?, ?);");
if(!$stmt) {
  echo json_encode(array(
    "success" => false,
    "message" => sprintf("Query prepare failed: %s \n", $mysqli->error)
  ));
  exit;
}
$pwd_hashed = password_hash($password, PASSWORD_BCRYPT);
$stmt->bind_param("ss", $username, $pwd_hashed);
if($stmt->execute()) {
  $stmt->close();
  echo json_encode(array(
    "success" => true
  ));
  exit;
} else { // when the username is already taken, mysql will throw a error
  echo json_encode(array(
    "success" => false,
    "message" => sprintf("Insertion failed: %s \n", $mysqli->error)
  ));
  $stmt->close();
  exit;
}
?>
