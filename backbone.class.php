<?php
require_once "base.class.php";

class Loader extends Base{
	public function init(){
		parent::init();
		$this->check_login(false);
	}

	public function projects(){
		$out = $this->DB->projects->find(array(
			"user" => array('$in' => array($this->user['_id'], '@all'))
		));
		$out->sort(array("stage" => 0));
		// get project progresses as requested by @ncpeak
		$out = iterator_to_array($out, false);
		foreach($out as &$item){
			$item['progress'] = $this->project_progress($item);
		}
		return $this->output($out);
	}

	public function project_by_id(){
		$out = $this->DB->projects->findOne(array(
			"_id" => new MongoId($this->phraw->request['pid']),
			"user" => array('$in' => array($this->user['_id'], '@all'))
		));
		if(is_array($out)){
			$out['progress'] = $this->project_progress($out);
		}
		$myProj = $this->DB->projects->find(array("user.0" => $out['user'][0]));
		$disk = 0;
		foreach($myProj as $proj){
			$disk += $proj['disk'];
		}
		$out['disk'] = $disk;
		$this->output_page_perm = true;
		return $this->output($out);
	}

	/**
	 * Calculate project progress
	 * Not available via AJAX, internal API only.
	 * @param Object Project data
	 */
	public function project_progress($item){
		$pages = $this->DB->pages->find(array(
			"project" => $item['_id']
		), array("stage" => true));
		$totalPages = $pages->count();
		$progress = 0;
		$totalStages = 4;
		foreach($pages as $page){
			$progress += $page['stage'];
		}
		if($totalPages > 0){
			return ($progress/($totalPages * $totalStages)) * 100;
		}else{
			return 0;
		}
	}

	public function pages($pid=null){
		if($pid === null){
			$pid = $this->phraw->request['pid'];
		}
		// Check ACL
		$project = $this->DB->projects->findOne(array(
			"_id" => new MongoId($pid),
			"user" => array('$in' => array($this->user['_id'], '@all'))
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
				"user" => array('$in' => array($this->user['_id'], '@all'))
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
			"user" => array('$in' => array($this->user['_id'], '@all'))
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
		$allowAdd = true;
		if(isset($_GET['token'])){
			// XXX: This allow viewing of all images, even ones that is not used in this page
			$allowAdd = false;
			$page = $this->DB->pages->findOne(array(
				"viewtoken" => (string) $_GET['token']
			), array("project"));
			if(!$page){
				$this->fatal_error("View token not found");
			}
			$project = $this->DB->projects->findOne(array(
				"_id" => $page['project'],
			));
		}else{
			$project = $this->DB->projects->findOne(array(
				"_id" => new MongoId($this->phraw->request['pid']),
				"user" => array('$in' => array($this->user['_id'], '@all'))
			));
		}
		if(!$project){
			$this->fatal_error("Project not found");
		}
		$iimg = $this->DB->iimg->findOne(array(
			"project" => $project['_id'],
			"file" => $this->phraw->request['id']
		));
		// checking the existant of the file
		/*$el = $this->load_fs_driver($project);
		$path = $el->path((string) $_GET['hash']);
		// remove the root path
		$path = preg_replace('~^[^/]+/~', "", $path);
		if(empty($path)){
			$this->fatal_error("Image file not found");
		}else if($path != $this->phraw->request['id']){
			print $path;
			$this->fatal_error("Hash does not match location");
		}*/
		if(!$iimg && $allowAdd){
			$iimg = array(
				"project" => $project['_id'],
				"file" => $this->phraw->request['id']
			);
			$this->DB->iimg->insert($iimg);
		}else if(!$iimg){
			$this->fatal_error("Image data not found");
		}
		return $this->output($iimg);
	}

	public function ryou(){
		// Check ACL
		$project = $this->DB->projects->findOne(array(
			"_id" => new MongoId($this->phraw->request['pid']),
			"user" => array('$in' => array($this->user['_id'], '@all'))
		));
		if(!$project){
			$this->fatal_error("Project not found");
		}
		$lyrics = $this->DB->lyrics->find(array(
			"project" => $project['_id'],
		), array("name", "stage"));
		return $this->output($lyrics);
	}

	public function ryou_by_id(){
		// Check ACL
		if(isset($_GET['token'])){
			// XXX: This allow viewing of all files, even ones that is not used in this page
			$page = $this->DB->pages->findOne(array(
				"viewtoken" => (string) $_GET['token']
			), array("project"));
			if(!$page){
				$this->fatal_error("View token not found");
			}
			$project = $this->DB->projects->findOne(array(
				"_id" => $page['project'],
			));
		}else{
			$project = $this->DB->projects->findOne(array(
				"_id" => new MongoId($this->phraw->request['pid']),
				"user" => array('$in' => array($this->user['_id'], '@all'))
			));
		}
		if(!$project){
			$this->fatal_error("Project not found");
		}
		$lyric = $this->DB->lyrics->findOne(array(
			"project" => $project['_id'],
			"_id" => new MongoId($this->phraw->request['id'])
		));
		if(!$lyric){
			$this->smarty->display_error();
		}
		return $this->output($lyric);
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
		if(isset($this->output_page_perm)){
			$creator = $v['user'][0];
			$creator = $this->DB->users->findOne(array('_id' => $creator));
			$v = array(
				'perms' => $this->limits_for_plan($creator['plan']),
				'data' => $v
			);
		}
		print json_encode($v);
	}

	public static function is_assoc ($arr){
		return (is_array($arr) && count(array_filter(array_keys($arr),'is_string')) == count($arr));
	}

	public static function rate_limit($min,$max){
		header("HTTP/1.1 403 Forbidden");
		print json_encode(array(
			'error' => 'Limit exceeded. Used '.$min.' available '.$max
		));
		die();
	}
}

class Saver extends Loader{
	public function projects(){
		// check limit!
		if($this->user['limits']['project'] != -1){
			$used = $this->DB->projects->find(array('user' => (string) $this->user['_id']))->count();
			if($used >= $this->user['limits']['project']){
				$this->rate_limit($used, $this->user['limits']['project']);
			}
		}
		$data = $this->get_data();
		$data['user'] = array((string) $this->user['_id']);
		$this->DB->projects->insert($data);
		$data['progress'] = 0; // Used in UI
		// create bookfiles
		$this->load_fs_driver($data);
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
		$data['size'] = $proj['size']; // don't trust the client on this one
		$plan = $this->get_project_limit($proj);
		// find new collaborator
		$newCollab = array_diff($data['user'], $proj['user']);
		foreach($newCollab as $n){
			$u = $this->DB->users->findOne(array('_id' => $n));
			if(!$u){ // user not found. bye!
				$data['user'] = array_diff($data['user'], array($n));
				continue;
			}
			$uplan = $u['plan'] ? $u['plan'] : 'free';
			if($uplan == 'free'){
				// get list of shared projects
				$user_proj = $this->DB->projects->find(array('user' => $u['_id']));
				$free_cnt = 0;
				foreach($user_proj as $item){
					$pplan = $this->get_project_limit($item);
					if($pplan['plan'] == 'free'){
						$free_cnt += 1;
					}
				}
				if($free_cnt >= 2){
					// can't receive more share!
					$data['user'] = array_diff($data['user'], array($n));
					header('X-Share-Validation-Fail-'.$n.': Owned '.$free_cnt.' free projects');
				}
			}
		}
		if($plan['collab'] != -1){
			$data['user'] = array_slice($data['user'], 0, $plan['collab']);
		}
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
		), array("_id", "user"));
		if(!$project){
			$this->fatal_error("Project not found");
		}
		$data['project'] = $project['_id'];
		$plan = $this->get_project_limit($project);
		if($plan['page'] != -1){
			$cnt = $this->DB->pages->find(array('project' => $project['_id']))->count();
			if($cnt >= $plan['page']){
				$this->rate_limit($cnt, $plan['page']);
			}
		}
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

	public function ryou_by_id(){
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
		$this->DB->lyrics->update(array(
			"project" => $project['_id'],
			"_id" => new MongoId($this->phraw->request['id'])
		), $data);
		return parent::ryou_by_id();
	}

	public function ryou(){
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
		$this->DB->lyrics->insert($data);
		return $this->output($data);
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
			// Remove the user from project
			$this->DB->projects->update(array(
				'_id' => new MongoId($this->phraw->request['pid'])
			), array(
				'$pull' => array(
					'user' => $this->user['_id']
				)
			));
			return;
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
		$this->delTree('bookfiles/'.(string) $project['_id']);
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
	}

	public function iimg_by_id(){
		$project = $this->DB->projects->findOne(array(
			"_id" => new MongoId($this->phraw->request['pid']),
			"user" => $this->user['_id']
		), array("_id"));
		if(!$project){
			$this->fatal_error("Project not found");
		}
		$this->DB->iimg->remove(array(
			"project" => $project['_id'],
			"file" => $this->phraw->request['id']
		), $data);
	}

	public function ryou_by_id(){
		// Check ACL
		$project = $this->DB->projects->findOne(array(
			"_id" => new MongoId($this->phraw->request['pid']),
			"user" => $this->user['_id']
		));
		if(!$project){
			$this->fatal_error("Project not found");
		}
		$this->DB->lyrics->remove(array(
			"project" => $project['_id'],
			"_id" => new MongoId($this->phraw->request['id'])
		));
	}

	public static function delTree($dir) { 
		$files = array_diff(scandir($dir), array('.','..')); 
		foreach ($files as $file) { 
			(is_dir("$dir/$file")) ? delTree("$dir/$file") : unlink("$dir/$file"); 
		} 
		return rmdir($dir); 
	}
}