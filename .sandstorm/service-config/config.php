<?php
/**
 * Kyou configuration file
 * based on menome engine
 */

/**
 * SITE_KEY: Site encryption key. Do not disclose this. Use anything long and random.
 */
define("SITE_KEY", 'HdVU1gpEMxCVy6iNLrOo67ho+iyEv5vaVsbSTQcxhsPWYIK/kVI6LojOskWz00Yb');

define("PRODUCTION", true);

/**
 * MongoDB Connection string
 */
$mongoCls = "Mongo";
if(class_exists("MongoClient")){
	$mongoCls = "MongoClient";
}
$MONGO = new $mongoCls("mongodb:///var/run/mongodb-27017.sock");
// also change ->kyou to your database name
$DB = $MONGO->kyou;

$PAY_SSO = array(
	'callback' => 'http://payments.whs.in.th/',
	'app' => 'kyou',
	'secret' => ''
);

define('BOOKFILES', '/var/kyou/public/bookfiles/');

/**
 * File storage settings
 * See elFinder's connector configuration manual
 *
 * @see https://github.com/Studio-42/elFinder/wiki/Connector-configuration-options
 */
$STORAGE = array(
	"driver" => "LocalFileSystem",
	// additional driver settings
	'tmbPath' => BOOKFILES."thumbnails/",
	'tmbURL' => '/bookfiles/thumbnails/',
	'quarantine' => null
);

define('SMARTY_COMPILE_DIR', '/tmp/kyou/template_compiled');
define('SMARTY_CACHE_DIR', '/tmp/kyou/template_cached');
