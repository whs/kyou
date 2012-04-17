<?php
/**
 * menome core framework
 * URL Routing framework
 * @todo Get rid of phraw
 * @author whs
 * @since 21 Nov 2011
 * @package Engine
 */

class URLRouter{
	/**
	 * @param Array URL mapping. Supported formats: 
	 *        - array('regex' => array("file.php", array("cls", "method")))	> Call cls->init(); cls->method(); from file.php. If cls->init() is not exists then it is not called.
	 *        - array('regex' => array("file.php", "func"))					> Call func(); from file.php
	 *        - array('regex' => "file.php")								> Include file.php (deprecated)
	 * @param SmartyTemplateEngine Smarty object
	 * @param Array Mapping of class properties to set in the target class
	 * @param String Base include path
	 */
	public function __construct($url, $smarty=null, $passthru=null, $basepath=""){
		$this->url = $url;
		$this->smarty = $smarty;
		$this->passthru = $passthru;
		$this->basepath = $basepath;
	}
	/**
	 * Perform routing
	 */
	public function route(){
		global $phraw;
		$routeFound = false;
		foreach($this->url as $k=>$v){
			if($phraw->route($k)){
				if(is_array($v)){
					require $this->basepath.$v[0];
					if(is_array($v[1])){
						$this->obj = new $v[1][0]();
						$this->obj->smarty = $this->smarty;
						foreach($this->passthru as $o => $d){
							$this->obj->$o = $d;
						}
						if(method_exists($this->obj, "init")){
							call_user_func(array($this->obj, "init"));
						}
						call_user_func(array($this->obj, $v[1][1]));
					}else{
						call_user_func($v[1]);
					}
				}else{
					// Compat
					header("X-Warn: using compat layer");
					global $DB, $SMARTY, $current_user;
					require $this->basepath.$v;
				}
				$routeFound = true;
				break;
			}
		}
		if(!$routeFound){
			$this->notfound();
		}
	}
	public function notfound(){
		if($this->smarty){
			$this->smarty->display_error(404);
		}else{
			header("Content-Type: application/json");
			header("HTTP/1.0 404 Not Found");
			print json_encode(array("error" => "Endpoint not found."));
		}
	}
}