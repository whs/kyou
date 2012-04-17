<?php
require "base.class.php";

class menome_auth extends Base{
	private static $id="4f8d59db0d0b85a268000000";
	private static $secret="0dccb8ab8326b3f6c9419410b42642b56de87f42";
	public static $endpoint = "http://api.dev.menome.in.th/1/";
	public function auth(){
		if(!$_GET['code']){
			header("Location: ".self::$endpoint."auth/authorize?response_type=code&client_id=".self::$id);
		}else{
			$out = $this->http(self::$endpoint."auth/token", "POST", array(
				"grant_type" => "authorization_code",
				"code" => $_GET['code'],
				"client_secret" => self::$secret
			));
			$out = json_decode($out);
			$access_token = $out->access_token;
			$user = json_decode(file_get_contents(self::$endpoint."user/user.json?access_token=" . $access_token));
			if($user->id){
				$this->DB->users->insert(array(
					"_id" => $user->id
				));
				$this->set_user($user->id);
				header("Location: /");
			}else{
				header("Location: /auth");
			}
		}
	}
}

class AuthUI extends Base{
	public $authClass = "menome_auth";
	public function auth(){
		$auth = new $this->authClass;
		$auth->DB = $this->DB;
		$auth->auth();
	}
}