<?php
header("Content-Type: application/json");

// examine the login status
ini_set("session.cookie_httponly", 1);
session_start();

if(!isset($_SESSION["username"]) || !isset($_SESSION["id"])) {  // if the user is not logged in, then log the users out
  echo json_encode(array(
    "logedin" => false,
    "success" => false
  ));
  exit;
}

$json_str = file_get_contents("php://input");
$json_obj = json_decode($json_str, true);

$eventEid = $json_obj["eid"];
$eventToken = $json_obj["token"];

if($eventToken !== $_SESSION["token"]) {
  echo json_encode(array(
    "logedin" => false,
    "success" => false
  ));
  exit;
}

require 'database.php';

$stmt = $mysqli->prepare("delete from events where eid = ? and uid = ?");
if(!$stmt) {
  echo json_encode(array(
    "logedin" => true,
    "success" => false,
    "message" => sprintf("Query prepare failed: %s \n". $mysqli->error)
  ));
  exit;
}

$stmt->bind_param("ii", $eventEid, $_SESSION["id"]);
if($stmt->execute()) {
  $stmt->close();
  echo json_encode(array(
    "logedin" => true,
    "success" => true
  ));
  exit;
} else {
  echo json_encode(array(
    "logedin" => true,
    "success" => false,
    "message" => sprintf("Insertion failed: %s \n", $mysqli->error)
  ));
  $stmt->close();
  exit;
}
?>
