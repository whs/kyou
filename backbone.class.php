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
		$out = $this->DB->pages->find(array(
			"project" => $project['_id']
		), array('widgets' => false));
		$out->sort(array("weight" => 1));
		return $this->output($out);
	}

	public function page_by_id($project=null){
		$out = $this->DB->pages->findOne(array(
			"_id" => new MongoId($this->phraw->request['page'])
		));
		if(!$out){
			$this->fatal_error("No page");
		}
		if($project === null && (string) $out['project'] != $this->phraw->request['pid']){
			$this->fatal_error("Page doesn't belong to this project");
		}
		if(!$project){
			$project = $this->DB->projects->findOne(array(
				"_id" => $project === false ? new MongoId($out['project']) : new MongoId($this->phraw->request['pid']),
				"user" => $this->user['_id']
			));
		}
		if(!$project){
			$this->fatal_error("Project not found");
		}
		$project['id'] = (string) $project['_id'];
		//unset($project['_id']);
		$out['project'] = $project;
		return $this->output($out);
	}

	public function iimg(){
		// Check ACL
		$project = $this->DB->projects->findOne(array(
			"_id" => new MongoId($this->phraw->request['pid']),
			"user" => $this->user['_id']
		));
		if(!$project){
			$this->fatal_error("Project not found");
		}
		$iimg = $this->DB->iimg->find(array(
			"project" => $project['_id'],
		), array("file"));
		return $this->output($iimg);
	}

	public function iimg_by_id(){
		// Check ACL
		$project = $this->DB->projects->findOne(array(
			"_id" => new MongoId($this->phraw->request['pid']),
			"user" => $this->user['_id']
		));
		if(!$project){
			$this->fatal_error("Project not found");
		}
		$iimg = $this->DB->iimg->findOne(array(
			"project" => $project['_id'],
			"file" => $this->phraw->request['id']
		));
		$filePath = "bookfiles/".(string) $project['_id']."/" . $this->phraw->request['id'];
		$filePathAbs = realpath($filePath);
		if(!$filePathAbs){
			$this->fatal_error("File not found");
		}
		if(strpos($filePathAbs, realpath("bookfiles/".(string) $project['_id'])) !== 0){
			$this->fatal_error("File not found"); // Don't tell them the file exists
		}
		if(!$iimg){
			$iimg = array(
				"project" => $project['_id'],
				"file" => $this->phraw->request['id']
			);
			$this->DB->iimg->insert($iimg);
		}
		return $this->output($iimg);
	}

	public function format_output($v){
		if(!is_array($v)){
			$v = iterator_to_array($v, false);
		}
		foreach($v as &$x){
			if($x instanceof MongoId){
				$x = (string) $x;
			}
			if($this->is_assoc($x)){
				if($x['_id']){
					$x['id'] = (string) $x['_id'];
					unset($x['_id']);
				}
			}
			if(is_array($x)){
				foreach($x as &$y){
					if($y instanceof MongoId){
						$y = (string) $y;
					}
				}
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

	public static function is_assoc ($arr){
		return (is_array($arr) && count(array_filter(array_keys($arr),'is_string')) == count($arr));
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
		// Get old project
		$proj = $this->DB->projects->findOne(array(
			"_id" => new MongoId($this->phraw->request['pid']),
			"user" => $this->user['_id']
		));
		if(!$proj){
			$this->fatal_error("No project");
		}
		$data['user'] = array_merge(array($proj['user'][0]), $data['user'], array($this->user['_id']));
		$data['user'] = array_values(array_unique($data['user']));
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

	public function iimg_by_id(){
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
		$this->DB->iimg->update(array(
			"project" => $project['_id'],
			"file" => $this->phraw->request['id']
		), $data);
		return parent::iimg_by_id();
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

class Deleter extends Base{
	public function init(){
		parent::init();
		$this->check_login(false);
	}

	public function project_by_id(){
		$project = $this->DB->projects->findOne(array(
			"_id" => new MongoId($this->phraw->request['pid']),
			"user" => $this->user['_id']
		), array("_id", "user"));
		if(!$project){
			$this->fatal_error("Project not found");
		}
		if($project['user'][0] != $this->user['_id']){
			$this->fatal_error("User does not own this project");
		}
		$this->DB->projects->remove(array(
			"_id" => $project['_id']
		));
		$this->DB->pages->remove(array(
			"project" => $project['_id']
		));
		$this->DB->revisions->remove(array(
			"project" => $project['_id']
		));
		header("HTTP/1.0 410 Gone");
	}

	public function page_by_id(){
		$project = $this->DB->projects->findOne(array(
			"_id" => new MongoId($this->phraw->request['pid']),
			"user" => $this->user['_id']
		), array("_id"));
		if(!$project){
			$this->fatal_error("Project not found");
		}
		$this->DB->pages->remove(array(
			"_id" => new MongoId($this->phraw->request['page']),
			"project" => $project['_id']
		));
		header("HTTP/1.0 410 Gone");
	}
}