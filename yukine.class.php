<?php
require_once "base.class.php";

class Yukine extends Base{
	public function fm(){
		$this->load_project();
		// list files
		if(!is_dir("bookfiles/".(string) $this->projID)){
			mkdir("bookfiles/".(string) $this->projID);
		}
		$path = "bookfiles/".(string) $this->projID . $_REQUEST['path'];
		if(strstr($_REQUEST['path'], "..")){
			$this->smarty->display_error(403);
			die();
		}
		if(!is_dir($path)){
			die();
		}
		if(isset($_POST['delete'])){
			if(strstr($_POST['delete'], "/")){
				$this->smarty->display_error(403);
				die();
			}
			unlink($path."/".$_POST['delete']);
			die();
		}
		$this->smarty->assign("dir", scandir($path));
		$this->smarty->assign("dirname", preg_replace('~/$~', "", $path));
		if(isset($_POST['dirname'])){
			if(strstr($_POST['dirname'], "/")){
				$this->smarty->display_error(403);
				die();
			}
			@mkdir($path."/".$_POST['dirname']);
			$this->smarty->display("yukinedir.html");
		}else if(isset($_POST['rmdir'])){
			if(strstr($_POST['rmdir'], "..")){
				$this->smarty->display_error(403);
				die();
			}
			@rmdir($path."/".$_POST['rmdir']);
			$this->smarty->display("yukinedir.html");
		}else if(isset($_GET['path'])){
			$this->smarty->display("yukinefile.html");
		}else{
			$this->smarty->display("yukine.html");
		}
	}
	public function upload(){
		$this->load_project();
		$path = "bookfiles/".(string) $this->projID.$_POST['path'];
		if(strstr($_POST['path'], "..")){
			$this->smarty->display_error(403);
			die();
		}
		foreach($_FILES['file']['name'] as $ind => $fn){
			if(strstr($fn, "/")){
				$this->display_error(403);
				die();
			}
			move_uploaded_file($_FILES['file']['tmp_name'][$ind], $path."/".$fn);
		}
		print "OK";
	}
	public function picker(){
		$this->load_project();
		$path = $this->path_resolve($_GET['path']);
		if(!$path){
			$path = "/";
		}
		if(strstr($path, "..")){
			$this->smarty->display_error(403);
			die();
		}
		$abspath = "bookfiles/".(string) $this->projID . $path;
		if(!is_dir($abspath)){
			die();
		}
		$this->smarty->assign("dir", scandir($abspath));
		$this->smarty->assign("path", $path);
		$this->smarty->assign("abspath", $abspath);
		$this->smarty->display("yukinepicker.html");
	}

	public function path_resolve($path){
		$pattern = '/\w+\/\.\.\//';
		while(preg_match($pattern,$path)){
			$path = preg_replace($pattern, '', $path);
		}
		return $path;
	}

	public function load_project(){
		$this->check_login();
		$this->projID = new MongoId($this->phraw->request['id']);
		$this->proj = $this->DB->projects->findOne(array(
			"_id" => $this->projID,
			"user" => $this->user['_id']
		));
		if(!$this->proj){
			$this->smarty->display_error();
			die();
		}
		$this->smarty->assign("project", $this->proj);
	}
}