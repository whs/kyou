<?php
require_once "php/elFinderConnector.class.php";

class KyouelConnector extends elFinderConnector{
	protected function output(array $data) {
		$header = isset($data['header']) ? $data['header'] : $this->header;
		unset($data['header']);
		header('Content-Type: text/plain');
		if ($header) {
			if (is_array($header)) {
				foreach ($header as $h) {
					header($h);
				}
			} else {
				header($header);
			}
		}
		
		if (isset($data['pointer'])) {
			rewind($data['pointer']);
			fpassthru($data['pointer']);
			if (!empty($data['volume'])) {
				$data['volume']->close($data['pointer'], $data['info']['hash']);
			}
			return;
		} else {
			if (!empty($data['raw']) && !empty($data['error'])) {
				print $data['error'];
				return $data['error'];
			} else {
				header('Content-Type: application/json');
				print json_encode($data);
				return data;
			}
		}
		
	}
}