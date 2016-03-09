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
			mkdir(OUTPUT."tmp/".$id);
			header("Content-Type: application/json");
			print json_encode(array(
				"id" => $id
			));
			flush();
			$this->copy_resources($project, OUTPUT."tmp/".$id);
			die();
		}else if($_GET['act'] == "save" && preg_match('~^[0-9a-f]+$~', $_GET['ticket']) && !strstr($_GET['file'], "/")){
			file_put_contents(OUTPUT."tmp/".$_GET['ticket']."/".$_GET['file'].".html", file_get_contents("php://input"));
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
				@mkdir(OUTPUT."tmp/".$_POST['ticket']."/".dirname($item), 0777, true);
				if(is_readable("compiled/".$item)){
					$itemp = realpath("compiled/".$item);
				}
				copy($itemp, OUTPUT."tmp/".$_POST['ticket']."/".$item);
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
						@mkdir(OUTPUT."tmp/".$_POST['ticket']."/".$item, 0777, true);
						$this->recurse_copy($item, OUTPUT."tmp/".$_POST['ticket']."/".$item);
					}else{
						@mkdir(OUTPUT."tmp/".$_POST['ticket']."/".dirname($item), 0777, true);
						if(is_readable("compiled/".$item)){
							$itemp = realpath("compiled/".$item);
						}
						copy($itemp, OUTPUT."tmp/".$_POST['ticket']."/".$item);
					}
				}
			}
			die();
		}else if($_POST['act'] == "pack" && preg_match('~^[0-9a-f]+$~', $_POST['ticket'])){
			$dirname = $project['appid'];
			if($_POST['output'] == "zip"){
				$pages = $this->loader->pages();
				// Write Chrome JSON
				file_put_contents(OUTPUT."tmp/".$_POST['ticket']."/manifest.json", $this->get_chrome_json($project, $pages));
				// PhoneGap Build XML
				file_put_contents(OUTPUT."tmp/".$_POST['ticket']."/config.xml", $this->get_phonegap_xml($project));
				// Copy icon
				if(!is_file(OUTPUT."tmp/".$_POST['ticket']."/icon.png")){
					copy(OUTPUT."tmp/".$_POST['ticket']."/".$project['icon128'], OUTPUT."tmp/".$_POST['ticket']."/icon.png");
				}
				// Copy navigator
				if($_POST['incnav'] === "true"){
					$navPath = "assets/nav.css";
					if(is_readable("compiled/".$navPath)){
						$navPath = "compiled/".$navPath;
					}
					copy($navPath, OUTPUT."tmp/".$_POST['ticket']."/nav.css");
					file_put_contents(OUTPUT."tmp/".$_POST['ticket']."/nav.js", $this->gen_navigator($project));
				}
			}else if($_POST['output'] == "hpub"){
				$dirname = "book";
				$pages = $this->loader->pages();
				file_put_contents(OUTPUT."tmp/".$_POST['ticket']."/book.json", $this->get_hpub_json($project, $pages));
			}else{
				$this->fatal_error("Invalid output format");
			}
			// Zip
			$oldfiles = glob(OUTPUT.$project['id']."*.zip");
			if(count($oldfiles) > 0){
				foreach($oldfiles as $file){
					@unlink($file);
				}
			}
			$output = $project['id']."_".uniqid().".zip";
			$this->zip(OUTPUT."tmp/".$_POST['ticket']."/", OUTPUT.$output, $dirname);
			
			$this->rrmdir("/var/www");
			rename(OUTPUT."tmp/".$_POST['ticket']."/", "/var/www/");
			$publicId = `/opt/app/sandstorm-integration/bin/getPublicId {$_SERVER['HTTP_X_SANDSTORM_SESSION_ID']}`;

			header("Content-Type: application/json");
			print json_encode(array(
				"output" => 'output/' . $output,
				"id" => explode("\n", $publicId)
			));
			die();
		}
		$this->smarty->assign("use_template_pack", is_readable("compiled/templates.js"));
		$this->smarty->assign("project", $project);
		$this->smarty->display("fuko.html");
	}

	/**
	 * Remnant, not used. May not actually work anymore.
	 * @deprecated
	 */
	public function estimated_size(){
		$project = $this->phraw->request['pid'];
		$totalSize = 650 * 1024;
		// Pages
		$pages = $this->DB->pages->find(array(
			"project" => new MongoId($project)
		))->count();
		$totalSize += $pages * 25 * 1024; // Approximation
		// Resource files
		$el = $this->load_fs_driver($project);
		$totalSize += $el->exec("size", array(
			"targets" => $el->volumes
		));
		return $totalSize;
	}
	public function copy_resources($project, $output){
		$el = $this->load_fs_driver($project);
		@mkdir($output);
		return $this->el_recurse_copy($el, $output);
	}
	public function el_recurse_copy($el, $dst, $path='!!init', $realpath=''){
		// elFinder checks init using empty() and not true/false
		$open_data = array(
			"target" => $path,
		);
		if($path == '!!init'){
			$open_data['init'] = true;
		}
		$dir = $el->exec("open", $open_data);
		foreach($dir['files'] as $file){
			if($file['hash'] == $dir['cwd']['hash'] || (isset($dir['cwd']['phash']) && $file['hash'] == $dir['cwd']['phash'])){
				continue;
			}
			if($file['mime'] == "directory"){
				mkdir($dst."/".$realpath.$file['name']);
				$this->el_recurse_copy($el, $dst, $file['hash'], $realpath.$file['name']."/");
			}else{
				$finfo = $el->exec("file", array(
					"target" => $file['hash']
				));
				$fp = fopen($dst . "/" . $realpath . "/" . $file['name'], 'wb');
				while($d = fread($finfo['pointer'], 128 * 1024)){ // 128k Chunk. Selected randomly ..?
					fwrite($fp, $d);
				}
			}
		}
	}
	public function recurse_copy($src, $dst){
		$dir = opendir($src);
		@mkdir($dst);
		while(false !== ($file = readdir($dir))){
			if(($file != '.') && ($file != '..')){
				if(is_dir($src . '/' . $file)){
					$this->recurse_copy($src . '/' . $file,$dst . '/' . $file);
				}else{
					$path = $src . '/' . $file;
					if(is_file('compiled/'.$path)){
						$path = 'compiled/'.$path;
					}
					copy($path,$dst . '/' . $file);
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
	function zip($source, $destination, $dirname=""){
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
					$zip->addEmptyDir($dirname."/".str_replace($source . '/', '', $file . '/'));
				}else if (is_file($file) === true){
					$zip->addFromString($dirname."/".str_replace($source . '/', '', $file), file_get_contents($file));
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
				"pages" => array("index.html")
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
		// JSON_PRETTY_PRINT is not available < PHP 5.4
		if(PHP_MAJOR_VERSION >= 5 && PHP_MINOR_VERSION >= 4){
			return json_encode($out, JSON_PRETTY_PRINT);
		}else{
			return json_encode($out);
		}
	}
	public function get_hpub_json($project, $pages){
		$out = array(
			"hpub" => 1,
			"title" => $project['name'],
			"author" => $project['author'],
			"url" => $project['bakerurl'],
			"publisher" => "Kyou HPub 1.0",
			"creator" => (string) $this->user,
			"date" => date("Y-m-d"),
			"orientation" => "landscape",
			"zoomable" => $project['bakerzoom'],
			"-baker-rendering" => "screenshots",
			"-baker-media-autoplay" => true,
			"contents" => array()
		);
		if(!empty($project['cover'])){
			$out['cover'] = $project['cover'];
		}
		if(!empty($project['bakerlandscapebg'])){
			$out['-baker-background-image-landscape'] = $project['bakerlandscapebg'];
		}
		if(!empty($project['bakerportraitbg'])){
			$out['-baker-background-image-portrait'] = $project['bakerportraitbg'];
		}
		foreach($pages as $page){
			$out['contents'][] = array(
				"url" => $page['id'] . ".html",
				"title" => $page['name']
			);
		}
		// JSON_PRETTY_PRINT is not available < PHP 5.4
		if(PHP_MAJOR_VERSION >= 5 && PHP_MINOR_VERSION >= 4){
			return json_encode($out, JSON_PRETTY_PRINT);
		}else{
			return json_encode($out);
		}
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
				$this->phonegap_pref($xml, "orientation", "landscape");
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
		$navPath = "assets/nav.js";
		if(is_readable("compiled/".$navPath)){
			$navPath = "compiled/".$navPath;
		}
		$out .= file_get_contents($navPath);
		return $out;
	}
}