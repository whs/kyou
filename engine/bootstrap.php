<?php
/**
 * menome core engine
 * Bootstrapper
 * @author whs
 * @since 21 Nov 2011
 * @package Engine
 */

// Bootstrap Phraw
require_once "lib/phraw/phraw.php";
$phraw = new Phraw();
$phraw->add_include_path("lib");

// Bootstrap Smarty and set default options
require_once "phraw/extensions/smarty.php";
$SMARTY = new SmartyTemplateEngine();
$SMARTY->plugins_dir  = array(SMARTY_DIR . 'plugins/');
$SMARTY->caching = Smarty::CACHING_OFF;

$SMARTY->assign("appurl", "http://".$_SERVER['HTTP_HOST']);
$SMARTY->assign("cururl", $_SERVER["REQUEST_URI"]);

// 30 days season
ini_set('session.gc_maxlifetime', 30*24*3600);
session_set_cookie_params(30*24*3600);
// TODO: Internationalization
date_default_timezone_set("Asia/Bangkok");