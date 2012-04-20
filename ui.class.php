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
		$this->loader->phraw = $this->phraw;
	}
	public function index(){
		$this->check_login();
		$projects = $this->loader->projects();
		$this->smarty->assign("projects", $projects);
		$this->smarty->display("index.html");
	}
	public function page(){
		$this->check_login();
		$page = $this->loader->page_by_id(false);
		$this->smarty->assign("page", $page);
		$this->smarty->assign("project", $page['project']);
		$this->smarty->display("page.html");
	}
}