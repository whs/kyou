<?php
require_once "base.class.php";

class Loader extends Base{
	public function init(){
		parent::init();
		$this->check_login(false);
	}

	public function projects(){
		$out = $this->DB->projects->find(array(
			"user" => $this->user['_id']
		));
		$out->sort(array("stage" => 0));
		return $this->output($out);
	}

	public function project_by_id(){
		$out = $this->DB->projects->findOne(array(
			"_id" => new MongoId($this->phraw->request['pid']),
			"user" => $this->user['_id']
		));
		return $this->output($out);
	}

	public function pages(){
		// Check ACL
		$project = $this->DB->projects->findOne(array(
			"_id" => new MongoId($this->phraw->request['pid']),
			"user" => $this->user['_id']
		));
		if(!$project){
			$this->fatal_error("Project not found");
		}
		$out = $this->DB->pages->findOne(array(
			"project" => $project['_id']
		));
		$project['id'] = $project['_id'];
		unset($project['_id']);
		$out['project'] = $project;
		return $this->output($out);
	}

	public function page_by_id(){
		$out = $this->DB->pages->findOne(array(
			"_id" => $this->phraw->request['page']
		));
		if(!$out){
			$this->fatal_error("No page");
		}
		if((string) $out['project'] != $this->phraw->request['pid']){
			$this->fatal_error("Page doesn't belong to this project");
		}
		$project = $this->DB->projects->findOne(array(
			"_id" => new MongoId($this->phraw->request['pid']),
			"user" => $this->user['_id']
		));
		if(!$project){
			$this->fatal_error("Project not found");
		}
		$project['id'] = $project['_id'];
		unset($project['_id']);
		$out['project'] = $project;
		return $this->output($out);
	}

	public function format_output($v){
		if(!is_array($v)){
			$v = iterator_to_array($v, false);
		}
		foreach($v as &$x){
			if($x instanceof MongoId){
				$x = (string) $x;
			}
			if(is_array($x)){
				$x['id'] = (string) $x['_id'];
				unset($x['_id']);
			}
		}
		if(isset($v['_id'])){
			$v['id'] = (string) $v['_id'];
			unset($v['_id']);
		}
		return $v;
	}

	public function output($v){
		header("Content-Type: application/json");
		$v = $this->format_output($v);
		print json_encode($v);
	}
}

class Saver extends Loader{
	public function projects(){
		$data = $this->get_data();
		$data['user'] = array((string) $this->user['_id']);
		$this->DB->projects->insert($data);
		if($_GET['return']){
			header("Location: ".$_GET['return']);
		}else{
			return $this->output($data);
		}
	}

	public function project_by_id(){
		$data = $this->get_data();
		unset($data['id']);
		$this->DB->projects->update(array(
			"_id" => new MongoId($this->phraw->request['pid']),
			"user" => $this->user['_id']
		), $data); // Yes, don't use $set
		return parent::project_by_id();
	}

	public function pages(){
		$data = $this->get_data();
		$project = $this->DB->projects->findOne(array(
			"_id" => new MongoId($this->phraw->request['pid']),
			"user" => $this->user['_id']
		), array("_id"));
		if(!$project){
			$this->fatal_error("Project not found");
		}
		$data['project'] = $project['_id'];
		$this->DB->pages->insert($data);
		return $this->output($data);
	}

	public function page_by_id(){
		$project = $this->DB->projects->findOne(array(
			"_id" => new MongoId($this->phraw->request['pid']),
			"user" => $this->user['_id']
		), array("_id"));
		if(!$project){
			$this->fatal_error("Project not found");
		}
		$data = $this->get_data();
		unset($data['id']);
		$data['project'] = $project['_id'];
		$this->DB->pages->update(array(
			"_id" => new MongoId($this->phraw->request['page']),
			"project" => $project['_id']
		), $data);
		return parent::page_by_id();
	}

	public function get_data(){
		$data = file_get_contents("php://input");
		if($_SERVER['CONTENT_TYPE'] == "application/json"){
			return json_decode($data, true);
		}else{
			return $data;
		}
	}
}