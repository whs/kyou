<?php
/**
 * Kyou configuration file
 * based on menome engine
 */

/**
 * SITE_KEY: Site encryption key. Do not disclose this. Use anything long and random.
 */
define("SITE_KEY", 'asdf');

define("PRODUCTION", true);

/**
 * MongoDB Connection string
 */
$mongoCls = "Mongo";
if(class_exists("MongoClient")){
	$mongoCls = "MongoClient";
}
$MONGO = new $mongoCls("mongodb://kyou:kyou@localhost/kyou");
// also change ->kyou to your database name
$DB = $MONGO->kyou;

$PAY_SSO = array(
	'callback' => 'http://payments.whs.in.th/',
	'app' => 'kyou',
	'secret' => ''
);

/**
 * File storage settings
 * See elFinder's connector configuration manual
 *
 * @see https://github.com/Studio-42/elFinder/wiki/Connector-configuration-options
 */
$STORAGE = array(
	"driver" => "LocalFileSystem",
	// additional driver settings
	'tmbPath' => dirname(__FILE__)."/../bookfiles/thumbnails/",
	'tmbURL' => '/bookfiles/thumbnails/',
	'quarantine' => null
);
/*/
// Example of MongoGridFS configuration
$STORAGE = array(
	"driver" => "MongoGridFS", // LocalFileSystem, MySQL
	'db' => $DB,
);
/**/
