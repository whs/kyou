<?php
/**
 * Smarty plugin
 * @package Smarty
 * @subpackage PluginsModifier
 */

/**
 * Smarty filesize modifier plugin
 * 
 * Type:     modifier
 * Name:     filesize
 * Purpose:  show the filesize of a file in kb, mb, gb etc...
 * 
 * @param string $ 
 * @return string 
 */
function smarty_modifier_filesize($size){
	$size = max(0, (int)$size);
	$units = array( 'b', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB');
	$power = $size > 0 ? floor(log($size, 1024)) : 0;
	return number_format($size / pow(1024, $power), 2, '.', ',') . $units[$power];
} 
