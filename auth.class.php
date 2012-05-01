<?php
require "base.class.php";

class menome_auth extends Base{
	private $id;
	private $secret;
	public $endpoint;
	public function __construct(){
		if($_SERVER['SERVER_NAME'] == "dev.kyou.sunburn.in.th"){
			$this->id = "4f8d59db0d0b85a268000000";
			$this->secret = "0dccb8ab8326b3f6c9419410b42642b56de87f42";
			$this->endpoint = "http://api.dev.menome.in.th/1/";
		}else{
			$this->id = "4f9ea39c725635520c000267";
			$this->secret = "13b47c63f3631501f7ddb7ca6653a7d631aa6bcc";
			$this->endpoint = "https://api.menome.in.th/1/";
		}
	}
	public function auth(){
		if(!$_GET['code']){
			header("Location: ".$this->endpoint."auth/authorize?response_type=code&client_id=".$this->id);
		}else{
			$out = $this->http($this->endpoint."auth/token", "POST", array(
				"grant_type" => "authorization_code",
				"code" => $_GET['code'],
				"client_secret" => $this->secret
			));
			$out = json_decode($out);
			$access_token = $out->access_token;
			$user = json_decode(file_get_contents($this->endpoint."user/user.json?access_token=" . $access_token));
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