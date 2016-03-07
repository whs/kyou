<?php
/**
 * Smarty extension.
 * 
 * @copyright Copyright (C) 2010-2011 Davide Muzzarelli <davide@davideweb.com>. All rights reserved.
 * @license BSD, see LICENSE.txt for more details.
 */
 
require_once('smarty/SmartyBC.class.php');

/**
 * Smarty, the default template engine for Phraw.
 */ 
class SmartyTemplateEngine extends SmartyBC {

    /**
     * Constructor. Set the working directories. Disable some features if the debug mode is active.
     *
     * @param bool $caching Activate the template caching.
     */
    function __construct($caching=true) {
        parent::__construct();
        $this->template_dir = RESOURCES_DIR . '/templates/';
        if(defined('SMARTY_COMPILE_DIR')){
            $this->compile_dir = SMARTY_COMPILE_DIR;
        }else{
            $this->compile_dir = RESOURCES_DIR . '/compiled/';
        }

        if(defined('SMARTY_CACHE_DIR')){
            $this->cache_dir = SMARTY_CACHE_DIR;
        }else{
            $this->cache_dir = RESOURCES_DIR . '/cached/';
        }
        $this->caching = $caching;
    }
    
    /**
     * Display a client error page.
     * 
     * @param int $type Type of message. Default: 404 Page Not Found.
     */
    function display_error($type=404) {
        Phraw::client_error($type);
		$this->setCaching(0);
        $this->display($type . '.html');
    }
}
?>