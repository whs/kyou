<?php
require_once "base.class.php";
require_once "backbone.class.php";

class UILoader extends Loader{
	public function output($x){
		return $this->format_output($x);
	}
}

class UI extends Base{
	public function init(){
		parent::init();
		$this->loader = new UILoader;
		$this->loader->DB = $this->DB;
		$this->loader->user = $this->user;
	}
	public function index(){
		$this->check_login();
		$projects = $this->loader->projects();
		$this->smarty->assign("projects", $projects);
		$this->smarty->display("index.html");
	}
}