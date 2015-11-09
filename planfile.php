<?php
define('KB', 1024);
define('MB', 1024 * KB);
define('GB', 1024 * MB);
$plans = array(
	'free' => array(
		'project' => 1,
		'page' => 5,
		'storage' => 30 * MB,
		'collab' => 2,
		'weight' => 0,
	),
	'indie' => array(
		'project' => 5,
		'page' => 15,
		'storage' => 0.5 * GB,
		'collab' => 5,
		'weight' => 100,
	),
	'publisher' => array(
		'project' => 10,
		'page' => 30,
		'storage' => 3 * GB,
		'collab' => 20,
		'weight' => 200,
	),
	'team' => array(
		'project' => 20,
		'page' => 30,
		'storage' => 7 * GB,
		'collab' => -1,
		'weight' => 300,
	),
	'sunburn' => array(
		'project' => -1,
		'page' => -1,
		'storage' => -1,
		'collab' => -1,
		'weight' => 999,
	),
);