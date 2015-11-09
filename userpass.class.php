<?php
require "base.class.php";

class UserPassAuth extends Base{
	public function auth(){
		$user = $this->DB->users->findOne(array(
			'_id' => (string) $_POST['username']
		));
		if(@crypt($_POST['password'], $user['password']) == $user['password']){
			$this->set_user($user['_id']);
			header("Location: /");
		}else{
			header("Location: /auth?badauth=1");
		}
	}
	public function register(){
		session_start();
		if(!isset($_SESSION['csrf'])){
			$_SESSION['csrf'] = bin2hex(openssl_random_pseudo_bytes(16));
		}
		if(isset($_POST['username'])){
			if(!preg_match('~^[a-z0-9]{1,12}$~', $_POST['username']) || !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL) || mb_strlen($_POST['password']) < 6 || $_POST['password'] != $_POST['password2']){
				$this->smarty->assign('error', 'Input validation failed');
			}else{
				$user = $this->DB->users->findOne(array('_id' => $_POST['username']));
				if($user){
					$this->smarty->assign('error', 'Duplicate username');	
				}else{
					$user = array(
						'_id' => (string) $_POST['username'],
						'password' => crypt($_POST['password'], '$2y$09$'.self::gen_salt()),
						'email' => (string) $_POST['email']
					);
					$this->DB->users->insert($user);
					$this->set_user($user['_id']);
					if(isset($_POST['pay'])){
						header("Location: /_payments/sso");
					}else{
						header("Location: /");
					}
					die();
				}
			}
		}
		$this->smarty->assign("csrf", $_SESSION['csrf']);
		$this->smarty->assign("pay", isset($_GET['pay']));
		$this->smarty->display("register.html");
	}
	// This function is for command line use only.
	public static function register_user(){
		global $DB, $argv;
		if(count($argv) == 1){
			print "usage: userpass.class.php user [pass]\nIf pass is not specified, it is generated.\n";
			return;
		}
		$user = $argv[1];
		if(count($argv) == 2){
			$pass = substr(sha1(microtime()), 0, 8);
			print "Password: ".$pass."\n";
		}else{
			$pass = $argv[2];
		}
		$DB->users->insert(array(
			'_id' => $user,
			'password' => crypt($pass, '$2y$09$'.self::gen_salt())
		));
		print "created\n";
	}
	public static function gen_salt(){
		if(function_exists("openssl_random_pseudo_bytes")){
			return bin2hex(openssl_random_pseudo_bytes(256));
		}else{
			return sha1(uniqid(uniqid((string) microtime(true), true), true));
		}
	}
}

if(PHP_SAPI == "cli" && basename($_SERVER['PHP_SELF']) == basename(__FILE__)){
	require_once "engine/config.php";
	error_reporting(E_ERROR);
	UserPassAuth::register_user();
}