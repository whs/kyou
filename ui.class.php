<?php
require_once "base.class.php";
require_once "backbone.class.php";

class UILoader extends Loader{
	public function output($x){
		return $this->format_output($x);
	}
}

class UI extends Base{
	const LOCK_PERIOD = 60;

	public function init(){
		parent::init();
		$this->loader = new UILoader;
		$this->loader->DB = $this->DB;
		$this->loader->user = $this->user;
		$this->loader->phraw = $this->phraw;
	}
	public function index(){
		if(!$this->user){
			header("Location: /auth");
			die();
		}
		$projects = $this->loader->projects();
		$this->smarty->assign("projects", $projects);
		$myProj = $this->DB->projects->find(array("user.0" => $this->user['_id']));
		$disk = 0;
		foreach($myProj as $proj){
			$disk += $proj['disk'];
		}
		$this->smarty->assign("disk", $disk);
		$this->smarty->display("index.html");
	}
	public function page(){
		$this->check_login();
		$page = $this->loader->page_by_id(false);
		$this->smarty->assign("page", $page);
		$this->smarty->assign("project", $page['project']);
		$this->smarty->assign("pagelist", $this->loader->pages($page['project']['id']));
		$this->smarty->assign("use_template_pack", is_readable("compiled/templates.js"));
		$this->smarty->display("page.html");
	}
	public function preview(){
		$page = $this->DB->pages->findOne(array(
			"viewtoken" => $this->phraw->request['p']
		));
		if(!$page){
			$this->smarty->display_error();
		}
		$project = $this->DB->projects->findOne(array(
			"_id" => $page['project']
		), array("name"));
		$page['project'] = $project;
		unset($page['note']);
		$page = $this->loader->output($page);
		$this->smarty->assign("page", $page);
		$this->smarty->assign("use_template_pack", is_readable("compiled/templates.js"));
		$this->smarty->display("preview.html");
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
		$this->smarty->assign("use_js_pack", is_readable("compiled/assets/ushio3d.js"));
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
	public function kotomi_app(){
		$this->check_login();
		$project = $this->loader->project_by_id(false);
		$this->smarty->assign("project", $project);
		$this->smarty->assign("files", $this->loader->iimg());
		$this->smarty->display("kotomi.html");
	}
	public function ryou_app(){
		$this->check_login();
		$project = $this->loader->project_by_id(false);
		$this->smarty->assign("project", $project);
		$this->smarty->assign("files", $this->loader->ryou());
		$this->smarty->assign("stage", array(
			0 => "Planning",
			1 => "Transcribing",
			2 => "Timing",
			3 => "Typesetting",
			4 => "QA",
			5 => "Done"
		));
		$this->smarty->display("ryou.html");
	}
	public function fm(){
		$this->check_login();
		$project = $this->loader->project_by_id(false);
		$this->smarty->assign("project", $project);
		$this->smarty->display("fm.html");
	}
	public function fm_endpoint(){
		$this->check_login();
		$project = $this->loader->project_by_id(false);
		$quota = $this->get_project_limit($project);
		$mountRO = false;

		$myProj = $this->DB->projects->find(array("user.0" => $project['user'][0]));
		$disk = 0;
		foreach($myProj as $proj){
			$disk += $proj['disk'];
		}

		if($disk > $quota['storage'] && $quota['storage'] != -1){
			$mountRO = true;
		}
		// for project shared with @all
		if(!in_array($this->user['_id'], $project['user'])){
			$mountRO = true;
		}
		require_once 'elfinder/kyou_connector.class.php';
		$elfinder = $this->load_fs_driver($project, $mountRO);
		$connector = new KyouelConnector($elfinder);
		$connector->run();
		if(in_array($_REQUEST['cmd'], explode(' ', 'mkfile duplicate paste upload put archive extract resize rm'))){
			// recalculate quota
			// find the root filesystem
			$root = $elfinder->exec('open', array('target' => '/', 'init' => true));
			$size = $elfinder->exec('size', array('targets' => array($root['cwd']['hash'])));
			// update the quota in database
			$this->DB->projects->update(array(
				'_id' => new MongoId($project['id'])
			), array(
				'$set' => array(
					'disk' => $size['size']
				)
			));
		}
	}

	public function ac_users(){
		$this->check_login();
		$users = $this->DB->users->find(array(
			'$and' => array(
				//array("_id" => array('$ne' => $_GET['owner'])),
				array("_id" => new MongoRegex('/'.preg_quote($_GET['q'], '/').'/i')),
			)
		), array("_id"));
		$users->limit(10);
		$out = array();
		foreach($users as $u){
			$out[] = array(
				"name" => (string) $u['_id'],
				"id" => (string) $u['_id']
			);
		}
		header("Content-Type: application/json");
		print json_encode($out);
	}
	public function lockman(){
		$this->check_login();
		header("Content-Type: application/json");
		if($_SERVER['REQUEST_METHOD'] == "GET"){
			$lock = $this->DB->locks->findOne(array(
				"page" => new MongoId((string) $this->phraw->request['page']),
				"time" => array('$gte' => new MongoDate(time() - $this::LOCK_PERIOD))
			));
			if($lock){
				print json_encode($lock);
			}
		}else if($_SERVER['REQUEST_METHOD'] == "POST"){
			$this->DB->locks->update(array(
				"page" => new MongoId((string) $this->phraw->request['page']),
				"user" => $this->user['_id']
			), array(
				'$set' => array(
					'time' => new MongoDate()
				)
			), array("upsert" => true));
			$otherLock = $this->DB->locks->findOne(array(
				"page" => new MongoId((string) $this->phraw->request['page']),
				"user" => array('$ne' => $this->user['_id']),
				"time" => array('$gte' => new MongoDate(time() - $this::LOCK_PERIOD))
			));
			print json_encode($otherLock);
		}else if($_SERVER['REQUEST_METHOD'] == "DELETE"){
			$this->DB->locks->remove(array(
				"page" => new MongoId((string) $this->phraw->request['page']),
				"user" => $this->user['_id']
			));
			header("X-Status: ".json_encode(array(
				"page" => new MongoId((string) $this->phraw->request['page']),
				"user" => $this->user['_id']
			)));
			print "true";
		}
	}

	public function widgets(){
		header("Content-Type: text/javascript");
		if(is_readable("compiled/widgets.js")){
			header("Location: compiled/widgets.js");
			die();
		}
		foreach(scandir("clientside/widgets/") as $f){
			if(is_file("clientside/widgets/".$f)){
				print file_get_contents("clientside/widgets/".$f);
				print "\n";
			}
		}
	}
	public function layouts(){
		header("Content-Type: text/javascript");
		if(is_readable("compiled/layouts.js")){
			header("Location: compiled/layouts.js");
			die();
		}
		foreach(scandir("clientside/layouts/") as $f){
			if(is_file("clientside/layouts/".$f)){
				print file_get_contents("clientside/layouts/".$f);
				print "\n";
			}
		}
	}
	public function ryou_provider(){
		header("Content-Type: text/javascript");
		if(is_readable("assets/ryou_provider.js")){
			header("Location: assets/ryou_provider.js");
			die();
		}
		foreach(scandir("assets/ryou_provider/") as $f){
			if(is_file("assets/ryou_provider/".$f)){
				print file_get_contents("assets/ryou_provider/".$f);
				print "\n";
			}
		}
	}
	public function foldersize($path) {
		$total_size = 0;
		$files = scandir($path);
		$cleanPath = rtrim($path, '/'). '/';

		foreach($files as $t) {
			if ($t<>"." && $t<>"..") {
				$currentFile = $cleanPath . $t;
				if (is_dir($currentFile)) {
					$size = foldersize($currentFile);
					$total_size += $size;
				}
				else {
					$size = filesize($currentFile);
					$total_size += $size;
				}
			}   
		}

		return $total_size;
	}
}
