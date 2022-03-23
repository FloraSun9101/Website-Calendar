<?php
header("Content-Type: application/json");

// examine the login status
ini_set("session.cookie_httponly", 1);
session_start();

if(!isset($_SESSION["username"]) || !isset($_SESSION["id"])) {  // if the user is not logged in, then log the users out
  echo json_encode(array(
    "logedin" => false
  ));
  exit;
}

$json_str = file_get_contents("php://input");
$json_obj = json_decode($json_str); // without setting true, decode into an object instead of array

$fromDate_year = $json_obj->fromDate->year;
$fromDate_month = $json_obj->fromDate->month;
$fromDate_date = $json_obj->fromDate->date;
$fromDate = sprintf("%d-%d-%d", $fromDate_year, $fromDate_month, $fromDate_date);

$toDate_year = $json_obj->toDate->year;
$toDate_month = $json_obj->toDate->month;
$toDate_date = $json_obj->toDate->date;
$toDate = sprintf("%d-%d-%d", $toDate_year, $toDate_month, $toDate_date);

require 'database.php';
$stmt = $mysqli->prepare("select eid, title, date, time, tag from events where uid=? and date>=? and date<=?");
if(!$stmt) {
  echo json_encode(array(
    "logedin" => true,
    "success" => false,
    "message" => sprintf("Query prepare failed: %s \n". $mysqli->error)
  ));
  exit;
}

$stmt->bind_param("iss", $_SESSION["id"], $fromDate, $toDate);
if($stmt->execute()) {
  $data = array(
    "logedin" => true,
    "success" => true,
  );

  $stmt->bind_result($eid, $title, $date, $time, $tag);

  $i = 0;
  while($stmt->fetch()) {
    $event = array(
      "eid" => $eid,
      "title" => $title,
      "date" => $date,
      "time" => $time,
      "tag" => $tag
    );
    array_push($data, $event);
    $i = $i + 1;
  }

  $data["eventCnt"] = $i;
  echo json_encode($data);
  $stmt->close();
  exit;
}
else {
  echo json_encode( array (
    "logedin" => true,
    "success" => false,
    "message" => sprintf("Read Event failed: %s \n", $mysqli->error)
  ));
  $stmt->close();
  exit;
}




?>
