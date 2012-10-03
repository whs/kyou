<?php
require_once "ui.class.php";

class Fuko extends UI{
	/**
	 * A bit of history: This was a seperate module called Nagisa the page sorter
	 * Later, it merged into Fuko and the name Nagisa is used in sharing system.
	 * and this code is called fuko_1 (but still use the method name nagisa)
	 * When the front page was redesigned, Fuko-1 was merged into the front page
	 */
	public function nagisa(){
		$project = $this->loader->project_by_id();
		if(isset($_POST['data'])){
			foreach($_POST['data'] as $item){
				$this->DB->pages->update(array(
					'_id' => new MongoId((string) $item['id']),
					'project' => new MongoId($project['id'])
				), array(
					'$set' => array(
						'weight' => (int) $item['weight']
					)
				));
			}
			die();
		}else{
			die();
		}
	}
	public function fuko_config(){
		$project = $this->loader->project_by_id();
		if($_POST['act'] == "ticket"){
			// Easy ID!
			$id = (string) new MongoId();
			mkdir("output/tmp/".$id);
			header("Content-Type: application/json");
			print json_encode(array(
				"id" => $id
			));
			flush();
			if(is_dir("bookfiles/".$project['id'])){
				$this->recurse_copy("bookfiles/".$project['id'], "output/tmp/".$id);
			}
			die();
		}else if($_GET['act'] == "save" && preg_match('~^[0-9a-f]+$~', $_GET['ticket']) && !strstr($_GET['file'], "/")){
			file_put_contents("output/tmp/".$_GET['ticket']."/".$_GET['file'].".html", file_get_contents("php://input"));
			die();
		}else if($_POST['act'] == "resfile" && preg_match('~^[0-9a-f]+$~', $_POST['ticket'])){
			$whitelist = array("assets", "files");
			foreach(array_merge($_POST['javascripts'], $_POST['stylesheets']) as $item){
				$itemp = realpath($item);
				$safe = false;
				foreach($whitelist as $w){
					if(strpos($itemp, realpath($w)) === 0){
						$safe = true;
						break;
					}
				}
				if(!$safe){
					header("X-Unsafe-File: ".$item);
					continue;
				}
				@mkdir("output/tmp/".$_POST['ticket']."/".dirname($item), 0777, true);
				copy($itemp, "output/tmp/".$_POST['ticket']."/".$item);
			}
			if(is_array($_POST['resources'])){
				foreach($_POST['resources'] as $item){
					$itemp = realpath($item);
					$safe = false;
					foreach($whitelist as $w){
						if(strpos($itemp, realpath($w)) === 0){
							$safe = true;
							break;
						}
					}
					if(!$safe){
						header("X-Unsafe-File: ".$item);
						continue;
					}
					if(is_dir($itemp)){
						@mkdir("output/tmp/".$_POST['ticket']."/".$item, 0777, true);
						$this->recurse_copy($itemp, "output/tmp/".$_POST['ticket']."/".$item);
					}else{
						@mkdir("output/tmp/".$_POST['ticket']."/".dirname($item), 0777, true);
						copy($itemp, "output/tmp/".$_POST['ticket']."/".$item);
					}
				}
			}
			die();
		}else if($_POST['act'] == "pack" && preg_match('~^[0-9a-f]+$~', $_POST['ticket'])){
			if($_POST['output'] == "zip"){
				$pages = $this->loader->pages();
				// Write Chrome JSON
				file_put_contents("output/tmp/".$_POST['ticket']."/manifest.json", $this->get_chrome_json($project, $pages));
				// PhoneGap Build XML
				file_put_contents("output/tmp/".$_POST['ticket']."/config.xml", $this->get_phonegap_xml($project));
				// Copy icon
				if(!is_file("output/tmp/".$_POST['ticket']."/icon.png")){
					copy("output/tmp/".$_POST['ticket']."/".$project['icon128'], "output/tmp/".$_POST['ticket']."/icon.png");
				}
				// Copy navigator
				copy("assets/nav.css", "output/tmp/".$_POST['ticket']."/nav.css");
				file_put_contents("output/tmp/".$_POST['ticket']."/nav.js", $this->gen_navigator($project));
				// Zip
				@unlink("output/".$project['id'].".zip");
				$this->zip("output/tmp/".$_POST['ticket']."/", "output/".$project['id'].".zip");
				$this->rrmdir("output/tmp/".$_POST['ticket']."/");
			}else{
				$this->fatal_error("Invalid output format");
			}
			die();
		}
		$this->smarty->assign("project", $project);
		$this->smarty->display("fuko.html");
	}

	public function estimated_size(){
		$project = $this->phraw->request['pid'];
		$totalSize = 650 * 1024;
		// Pages
		$pages = $this->DB->pages->find(array(
			"project" => new MongoId($project)
		))->count();
		$totalSize += $pages * 25 * 1024;
		// Yukine
		if(is_dir("bookfiles/".$project)){
			$totalSize += $this->foldersize("bookfiles/".$project);
		}
		return $totalSize;
	}
	public function foldersize($path) {
		$total_size = 0;
		$files = scandir($path);
		$cleanPath = rtrim($path, '/'). '/';

		foreach($files as $t) {
			if ($t<>"." && $t<>"..") {
				$currentFile = $cleanPath . $t;
				if (is_dir($currentFile)) {
					$size = $this->foldersize($currentFile);
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
	public function recurse_copy($src,$dst) { 
		$dir = opendir($src); 
		@mkdir($dst); 
		while(false !== ( $file = readdir($dir)) ) { 
			if (( $file != '.' ) && ( $file != '..' )) { 
				if ( is_dir($src . '/' . $file) ) { 
					$this->recurse_copy($src . '/' . $file,$dst . '/' . $file); 
				} 
				else { 
					copy($src . '/' . $file,$dst . '/' . $file); 
				} 
			} 
		} 
		closedir($dir); 
	}
	public function rrmdir($dir) {
		$fp = opendir($dir);
		if($fp){
			while($f = readdir($fp)){
				$file = $dir . "/" . $f;
				if($f == "." || $f == ".."){
					continue;
				}else if(is_dir($file) && !is_link($file)){
					$this->rrmdir($file);
				}else{
					unlink($file);
				}
			}
			closedir($fp);
			rmdir($dir);
		}
	}
	function zip($source, $destination){
		if (!extension_loaded('zip') || !file_exists($source)) {
			header("HTTP/1.0 500 Internal Server Error");
			print "ZIP extension is required";
			return false;
		}
		$zip = new ZipArchive();
		if (!$zip->open($destination, ZIPARCHIVE::CREATE)) {
			return false;
		}
		$source = str_replace('\\', '/', realpath($source));
		if (is_dir($source) === true){
			$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($source), RecursiveIteratorIterator::SELF_FIRST);
			foreach ($files as $file){
				if(basename($file) == ".." || basename($file) == "."){
					continue;
				}
				$file = str_replace('\\', '/', realpath($file));
				if (is_dir($file) === true && $source != $file){
					$zip->addEmptyDir(str_replace($source . '/', '', $file . '/'));
				}else if (is_file($file) === true){
					$zip->addFromString(str_replace($source . '/', '', $file), file_get_contents($file));
				}
			}
		}else if (is_file($source) === true){
			$zip->addFromString(basename($source), file_get_contents($source));
		}

		return $zip->close();
	}

	public function get_chrome_json($project, $pages){
		$out = array(
			"name" => $project['name'],
			"version" => $project['appver'],
			"manifest_version" => 2,
			"description" => $project['description'],
			"icons" => array(
				"128" => $project['icon128'],
			),
			"sandbox" => array(
				"pages" => array()
			),
			"minimum_chrome_version" => "22",
			"offline_enabled" => true,
			"app" => array(
				"launch" => array(
					"local_path" => "index.html"
				)
			)
		);
		if(!empty($project['icon16'])){
			$out['icons']['16'] = $project['icon16'];
		}
		if(!empty($project['icon48'])){
			$out['icons']['48'] = $project['icon48'];
		}
		foreach($pages as $page){
			$out['sandbox']['pages'][] = $page['id'] . ".html";
		}
		return json_encode($out, JSON_PRETTY_PRINT);
	}
	public function get_phonegap_xml($project){
		$xml = new XMLWriter();
		$xml->openMemory();
		$xml->setIndent(true);
		$xml->startDocument("1.0", "UTF-8");
			$xml->startElement("widget");
				$xml->startAttribute('xmlns');
					$xml->text('http://www.w3.org/ns/widgets');
				$xml->endAttribute();
				$xml->startAttribute('xmlns:gap');
					$xml->text('http://phonegap.com/ns/1.0');
				$xml->endAttribute();
				$xml->startAttribute('xmlns:gap');
					$xml->text('http://phonegap.com/ns/1.0');
				$xml->endAttribute();
				$xml->startAttribute('id');
					$xml->text($project['appid']);
				$xml->endAttribute();
				$xml->startAttribute('version');
					$xml->text($project['appver']);
				$xml->endAttribute();
				$xml->startElement("name");
					$xml->text($project['name']);
				$xml->endElement();	
				$xml->startElement("description");
					$xml->text($project['description']);
				$xml->endElement();
				$this->phonegap_pref($xml, "orientation", "portrait");
				$this->phonegap_pref($xml, "target-device", "tablet");
				$this->phonegap_pref($xml, "android-minSdkVersion", "8");
				$this->phonegap_pref($xml, "android-installLocation", "preferExternal");
				$this->phonegap_pref($xml, "permissions", "none");
			$xml->endElement();
		$xml->endDocument();
		return $xml->outputMemory();
	}
	private function phonegap_pref($xml, $key, $val){
		$xml->startElement("preference");
			$xml->startAttribute('name');
				$xml->text($key);
			$xml->endAttribute();
			$xml->startAttribute('value');
				$xml->text($val);
			$xml->endAttribute();
		$xml->endElement();
		return $xml;
	}
	public function gen_navigator($project){
		$pages = array();
		$pageInfo = array();
		$q = $this->DB->pages->find(array(
			"project" => new MongoId($project['id'])
		), array("_id", "name"));
		$q->sort(array("weight" => 1));
		$ind = 0;
		foreach($q as $page){
			if($ind == 0){
				$pages[] = "index.html";
				$pageInfo["index.html"] = $page['name'];
			}else{
				$pages[] = (string) $page['_id'].".html";
				$pageInfo[(string) $page['_id'].".html"] = $page['name'];
			}
			$ind++;
		}
		$out = "/* autogen */ var layout = ".json_encode($pages).";\n";
		$out .= "/* autogen */ var pageName = ".json_encode($pageInfo).";\n";
		$out .= file_get_contents("assets/nav.js");
		return $out;
	}
}