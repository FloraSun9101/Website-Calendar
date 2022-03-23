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

$eventTitle = $json_obj["eventTitle"];
$eventDate = $json_obj["eventDate"];
$eventTime = $json_obj["eventTime"];
$eventTag = $json_obj["eventTag"];
$eventToken = $json_obj["eventToken"];

if($eventToken !== $_SESSION["token"]) {
  echo json_encode(array(
    "logedin" => false,
    "success" => false
  ));
  exit;
}

require 'database.php';

$stmt = $mysqli->prepare("insert into events (uid, title, date, time, tag) values (?, ?, ?, ?, ?)");
if(!$stmt) {
  echo json_encode(array(
    "logedin" => true,
    "success" => false,
    "message" => sprintf("Query prepare failed: %s \n". $mysqli->error)
  ));
  exit;
}

$stmt->bind_param("issss", $_SESSION["id"], $eventTitle, $eventDate, $eventTime, $eventTag);
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
