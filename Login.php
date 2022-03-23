<?php
header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json

//Because you are posting the data via fetch(), php has to retrieve it elsewhere.
$json_str = file_get_contents('php://input');
//This will store the data into an associative array
$json_obj = json_decode($json_str, true);

//Variables can be accessed as such:
$username = $json_obj['username'];
$password = $json_obj['password'];
//This is equivalent to what you previously did with $_POST['username'] and $_POST['password']

// Check to see if the username and password are valid.  (You learned how to do this in Module 3.)
// chech the username again to prevent some one change the js code and sent invalid username to the server.
if( !preg_match('/^[\w_\-]+$/', $username) ){
  echo json_encode(array(
    "success" => false,
    "message" => sprintf("Query prepare failed: username contains special characters.")
  ));
}

require "database.php";
$stmt = $mysqli->prepare("SELECT count(*), id, password FROM users WHERE username=?");
if(!$stmt) {
  echo json_encode(array(
    "success" => false,
    "message" => sprintf("Query prepare failed: %s \n", $mysqli->error)
  ));
  exit;
}

$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->bind_result($cnt, $id, $pwd_hash);
$stmt->fetch();
if($cnt == 1 && password_verify($password, $pwd_hash)) {
  $stmt->close();
  ini_set("session.cookie_httponly", 1);
  session_start();
  $_SESSION['username'] = $username;
  $_SESSION['id'] = $id;
  $_SESSION['token'] = bin2hex(openssl_random_pseudo_bytes(32)); 

  echo json_encode(array(
    "success" => true,
    "username" => $username,
    "token" => $_SESSION['token']
  ));
  exit;
}else{
  $stmt->close();
  echo json_encode(array(
    "success" => false,
    "message" => "Incorrect Username or Password"
  ));
  exit;
}
?>
