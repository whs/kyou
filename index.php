<?php
require "engine/config.php";
require "engine/bootstrap.php";
require "engine/routing.php";

ob_start();

$router = new URLRouter(array(
	"" => array("ui.class.php", array("UI", "index")),
	"auth" => array("auth.class.php", array("AuthUI", "auth")),
), $SMARTY, array(
	"phraw" => $phraw,
	"DB" => $DB,
));

try{
	$router->route();
}catch(Exception $e){
	ob_end_clean();
	header("Content-Type: text/plain");
	print_r($e);
	die();
}