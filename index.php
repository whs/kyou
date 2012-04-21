<?php
require "engine/config.php";
require "engine/bootstrap.php";
require "engine/routing.php";

ob_start();

$router = new URLRouter(array(
	""											=> array("ui.class.php", array("UI", "index")),
	"page\/(?P<page>[a-f0-9]+)"					=> array("ui.class.php", array("UI", "page")),
	"auth"										=> array("auth.class.php", array("AuthUI", "auth")),

	"widgets.js"								=> array("ui.class.php", array("UI", "widgets")),

	"GET projects"									=> array("backbone.class.php", array("Loader", "projects")),
	"GET projects\/(?P<pid>[a-f0-9]+)"				=> array("backbone.class.php", array("Loader", "project_by_id")),
	"GET projects\/(?P<pid>[a-f0-9]+)\/pages"		=> array("backbone.class.php", array("Loader", "pages")),
	"GET projects\/(?P<pid>[a-f0-9]+)\/pages\/(?P<page>[a-f0-9]+)"	=> array("backbone.class.php", array("Loader", "page_by_id")),

	"POST projects"									=> array("backbone.class.php", array("Saver", "projects")),
	"PUT projects\/(?P<pid>[a-f0-9]+)"				=> array("backbone.class.php", array("Saver", "project_by_id")),
	"POST projects\/(?P<pid>[a-f0-9]+)\/pages"	=> array("backbone.class.php", array("Saver", "pages")),
	"PUT projects\/(?P<pid>[a-f0-9]+)\/pages\/(?P<page>[a-f0-9]+)"	=> array("backbone.class.php", array("Saver", "page_by_id")),

	"DELETE projects\/(?P<pid>[a-f0-9]+)"								=> array("backbone.class.php", array("Deleter", "project_by_id")),
	"DELETE projects\/(?P<pid>[a-f0-9]+)\/pages\/(?P<page>[a-f0-9]+)"	=> array("backbone.class.php", array("Deleter", "page_by_id")),	
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