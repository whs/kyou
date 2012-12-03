<?php
require "engine/config.php";
require "engine/bootstrap.php";
require "engine/routing.php";
require "strings.php";
if(is_readable("nonfree/strings.php")){
	require "nonfree/strings.php";
	$SMARTY->assign("nonfree", true);
}
$SMARTY->assign("strings", $strings);

ob_start();

$router = new URLRouter(array(
	""											=> array("ui.class.php", array("UI", "index")),
	"page\/(?P<page>[a-f0-9]+)"					=> array("ui.class.php", array("UI", "page")),
	"p\/(?P<p>[a-z0-9]+)"						=> array("ui.class.php", array("UI", "preview")),
	"page\/(?P<page>[a-f0-9]+)\/@lock"			=> array("ui.class.php", array("UI", "lockman")),
	"page\/(?P<page>[a-f0-9]+)\/revisions"		=> array("ui.class.php", array("UI", "ushio_world")),
	"page\/(?P<page>[a-f0-9]+)\/@save"			=> array("ui.class.php", array("UI", "ushio_save")),
	"page\/@load"								=> array("ui.class.php", array("UI", "ushio_load")),
	"rev\/(?P<rev>[a-f0-9]+)"					=> array("ui.class.php", array("UI", "ushio_rev")),
	"project\/(?P<pid>[a-f0-9]+)\/iimg\/"		=> array("ui.class.php", array("UI", "kotomi_app")),
	"project\/(?P<pid>[a-f0-9]+)\/lyric\/"		=> array("ui.class.php", array("UI", "ryou_app")),

	"_users"									=> array("ui.class.php", array("UI", "ac_users")),
	"auth"										=> array("auth.class.php", array("AuthUI", "auth")),
	"auth\/menome"							=> array("menomeauth.class.php", array("MenomeAuth", "auth")),

	"project\/(?P<pid>[a-f0-9]+)\/files\/"			=> array("ui.class.php", array("UI", "fm")),
	"project\/(?P<pid>[a-f0-9]+)\/files\/@endpoint"		=> array("ui.class.php", array("UI", "fm_endpoint")),
	"project\/(?P<id>[a-f0-9]+)\/files\/@pick"	=> array("yukine.class.php", array("Yukine", "picker")),

	"POST project\/(?P<pid>[a-f0-9]+)\/sort\/"		=> array("fuko.class.php", array("Fuko", "nagisa")),
	"project\/(?P<pid>[a-f0-9]+)\/dist\/"	=> array("fuko.class.php", array("Fuko", "fuko_config")),

	"widgets.js"								=> array("ui.class.php", array("UI", "widgets")),
	"layouts.js"								=> array("ui.class.php", array("UI", "layouts")),
	"ryou_provider.js"							=> array("ui.class.php", array("UI", "ryou_provider")),

	"GET projects"									=> array("backbone.class.php", array("Loader", "projects")),
	"GET projects\/(?P<pid>[a-f0-9]+)"				=> array("backbone.class.php", array("Loader", "project_by_id")),
	"GET projects\/(?P<pid>[a-f0-9]+)\/pages"		=> array("backbone.class.php", array("Loader", "pages")),
	"GET projects\/(?P<pid>[a-f0-9]+)\/pages\/(?P<page>[a-f0-9]+)"	=> array("backbone.class.php", array("Loader", "page_by_id")),
	"GET projects\/(?P<pid>[a-f0-9]+)\/iimg.json"					=> array("backbone.class.php", array("Loader", "iimg")),
	"GET projects\/(?P<pid>[a-f0-9]+)\/iimg\/(?P<id>.+)"			=> array("backbone.class.php", array("Loader", "iimg_by_id")),
	"GET projects\/(?P<pid>[a-f0-9]+)\/lyric.json"					=> array("backbone.class.php", array("Loader", "ryou")),
	"GET projects\/(?P<pid>[a-f0-9]+)\/lyric\/(?P<id>.+)"			=> array("backbone.class.php", array("Loader", "ryou_by_id")),

	"POST projects"									=> array("backbone.class.php", array("Saver", "projects")),
	"PUT projects\/(?P<pid>[a-f0-9]+)"				=> array("backbone.class.php", array("Saver", "project_by_id")),
	"POST projects\/(?P<pid>[a-f0-9]+)\/pages"		=> array("backbone.class.php", array("Saver", "pages")),
	"PUT projects\/(?P<pid>[a-f0-9]+)\/pages\/(?P<page>[a-f0-9]+)"	=> array("backbone.class.php", array("Saver", "page_by_id")),
	"PUT projects\/(?P<pid>[a-f0-9]+)\/iimg\/(?P<id>.+)"			=> array("backbone.class.php", array("Saver", "iimg_by_id")),
	"POST projects\/(?P<pid>[a-f0-9]+)\/lyric\/"					=> array("backbone.class.php", array("Saver", "ryou")),
	"PUT projects\/(?P<pid>[a-f0-9]+)\/lyric\/(?P<id>.+)"			=> array("backbone.class.php", array("Saver", "ryou_by_id")),

	"DELETE projects\/(?P<pid>[a-f0-9]+)"								=> array("backbone.class.php", array("Deleter", "project_by_id")),
	"DELETE projects\/(?P<pid>[a-f0-9]+)\/pages\/(?P<page>[a-f0-9]+)"	=> array("backbone.class.php", array("Deleter", "page_by_id")),	
	"DELETE projects\/(?P<pid>[a-f0-9]+)\/iimg\/(?P<id>.+)"				=> array("backbone.class.php", array("Deleter", "iimg_by_id")),
	"DELETE projects\/(?P<pid>[a-f0-9]+)\/lyric\/(?P<id>.+)"			=> array("backbone.class.php", array("Deleter", "ryou_by_id")),	
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