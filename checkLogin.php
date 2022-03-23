<?php
header("Content-Type: application/json");

ini_set("session.cookie_httponly", 1);
session_start();
if(isset($_SESSION["username"])) {
  echo json_encode(array(
    "login" => true,
    "username" => $_SESSION["username"],
    "token" => $_SESSION["token"]
  ));
  exit;
} else {
  echo json_encode(array(
    "login" => false
  ));
  exit;
}
?>
