<?php
require "base.class.php";

class AuthUI extends Base{
	const USE_DEV_AUTH=false;
	public $loadedAuth = array();
	public function __construct(){
		if(is_readable("menomeauth.class.php")){
			$this->loadedAuth[] = "menome";
		}
		if(is_readable("userpass.class.php")){
			$this->loadedAuth[] = "userpass";
		}
		if($this::USE_DEV_AUTH){
			$this->loadedAuth[] = "dev";
		}
	}
	public function auth(){
		$this->smarty->assign("loaded", $this->loadedAuth);
		if(isset($_GET['badauth'])){
			$this->smarty->assign("badauth", true);
		}
		setcookie("id", "", 1, "/");
		setcookie("secure", "", 1, "/");
		
		if($this::USE_DEV_AUTH){
			if(isset($_GET['devauth']) && $_GET['devauth'] == "login"){
				if(!empty($_POST['username']) && preg_match('~^[a-zA-Z]{1,15}$~', $_POST['username'])){
					try{
						$this->DB->users->insert(array(
							"_id" => (string) $_POST['username']
						));
					}catch(MongoCursorException $e){}
					$this->set_user($_POST['username']);
					header("Location: /");
					die();
				}
			}
		}
		
		$this->smarty->display("auth.html");
	}
}
