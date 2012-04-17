<?php
require_once "base.class.php";

class UI extends Base{
	public function index(){
		$this->check_login();
		$this->smarty->display("index.html");
	}
}