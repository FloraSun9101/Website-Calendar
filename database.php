<?php
// connect to the datebase on the server
$mysqli = new mysqli("localhost", "cse330Module5", "cse330Module5", "calendar");

if($mysqli->connect_errno){
  printf("Connection Failed: %s\n", $mysqli->connect_error);
}
?>
