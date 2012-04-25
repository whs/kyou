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
	public function ushio_world(){
		$this->check_login();
		$page = $this->loader->page_by_id(false);
		$rev = $this->DB->revisions->find(array(
			"ushio.id" => new MongoId($this->phraw->request['page'])
		), array("ushio.html" => false, "widgets" => false));
		$rev->sort(array("ushio.time" => -1));
		$rev = $this->loader->format_output($rev);
		$this->smarty->assign("rev", $rev);
		$this->smarty->assign("page", $page);
		$this->smarty->display("ushio.html");
	}
	public function ushio_save(){
		$this->check_login();
		$page = $this->DB->pages->findOne(array(
			"_id" => new MongoId($this->phraw->request['page'])
		));
		if(!$page){
			$this->smarty->display_error(404);
			die();
		}
		$page['ushio'] = array(
			"id" => new MongoId((string) $page['_id']),
			"user" => $this->user['_id'],
			"description" => $_POST['desc'],
			"time" => new MongoDate(),
			"html" => $_POST['html']
		);
		unset($page['_id']);
		$this->DB->revisions->insert($page);
	}
	public function ushio_load(){
		$this->check_login();
		$rev = $this->DB->revisions->findOne(array(
			"_id" => new MongoId((string) $_POST['rev'])
		));
		if(!$rev){
			$this->smarty->display_error(404);
			die();
		}
		$project = $this->DB->projects->findOne(array(
			"_id" => $rev['project'],
			"user" => $this->user['_id']
		));
		if(!$project){
			$this->smarty->display_error(403);
			die();
		}
		$rev['_id'] = new MongoId((string) $rev['ushio']['id']);
		unset($rev['ushio']);
		$this->DB->pages->save($rev);
	}
	public function ushio_rev(){
		$this->check_login();
		$rev = $this->DB->revisions->findOne(array(
			"_id" => new MongoId($this->phraw->request['rev'])
		));
		if(!$rev){
			$this->smarty->display_error(404);
			die();
		}
		$project = $this->DB->projects->findOne(array(
			"_id" => $rev['project'],
			"user" => $this->user['_id']
		));
		if(!$project){
			$this->smarty->display_error(403);
			die();
		}
		print $rev['ushio']['html'];
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