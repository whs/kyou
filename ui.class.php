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
		$this->smarty->assign("templates", $this->get_templates("layout").$this->get_templates("config"));
		$this->smarty->display("page.html");
	}
	public function widgets(){
		header("Content-Type: text/javascript");
		foreach(scandir("assets/widgets/") as $f){
			if(is_file("assets/widgets/".$f)){
				print file_get_contents("assets/widgets/".$f);
				print "\n";
			}
		}
	}
	public function layouts(){
		header("Content-Type: text/javascript");
		foreach(scandir("assets/layouts/") as $f){
			if(is_file("assets/layouts/".$f)){
				print file_get_contents("assets/layouts/".$f);
				print "\n";
			}
		}
	}
	public function get_templates($folder){
		$out = "";
		foreach(scandir("handlebars/".$folder."/") as $f){
			if(is_file("handlebars/".$folder."/".$f)){
				$out .= '<script id="tmpl_'.$folder.'_'.str_replace(".html", "", $f).'" type="text/x-handlebars-template">';
				$out .= file_get_contents("handlebars/".$folder."/".$f);
				$out .= "</script>";
			}
		}
		return $out;
	}
}