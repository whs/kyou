<?php
require_once 'base.class.php';

class Payments extends Base{
	public function sso(){
		global $PAY_SSO;
		if($this->user){
			$data = array(
				'user' => $this->user['_id'],
				'email' => $this->user['email'],
				'expire' => time() + 60,
				'nounce' => uniqid(),
			);
			$data['signature'] = hash_hmac('sha256', implode(';', $data), $PAY_SSO['secret']);
			$this->smarty->display('post_redirect.html', array(
				'data' => $data,
				'target' => $this->get_url().'sso'
			));
			return;
		}
		if(isset($_POST['optional']) && $_POST['optional'] == 'true'){
			$this->smarty->display('post_redirect.html', array(
				'data' => array('guest' => true),
				'target' => $this->get_url().'sso'
			));
		}else{
			header('Location: /');
		}
	}
	public function active(){
		global $PAY_SSO;
		header('Content-Type: text/plain');
		$sig = $_POST['user'] . ';' . $_POST['plan'] . ';' . $_POST['sub_expire'] . ';' . $_POST['expire'];
		if(hash_hmac('sha256', $sig, $PAY_SSO['secret']) != $_POST['signature']){
			print 'Invalid signature!';
			return;
		}
		$timeLeft = (int) $_POST['expire'] - time();
		if($timeLeft > 600 || $timeLeft < 0){
			print 'Signature expired, or clock skew.';
			return;
		}
		$this->DB->users->update(array(
			'_id' => (string) $_POST['user']
		), array(
			'$set' => array(
				'plan' => $_POST['plan']
			)
		));
		print 'OK';
	}
	public function expire(){
		global $PAY_SSO;
		header('Content-Type: text/plain');
		$sig = $_POST['user'] . ';' . $_POST['plan'] . ';' . $_POST['expire'];
		if(hash_hmac('sha256', $sig, $PAY_SSO['secret']) != $_POST['signature']){
			print 'Invalid signature!';
			return;
		}
		$timeLeft = (int) $_POST['expire'] - time();
		if($timeLeft > 600 || $timeLeft < 0){
			print 'Signature expired, or clock skew.';
			return;
		}
		$this->DB->users->update(array(
			'_id' => (string) $_POST['user']
		), array(
			'$unset' => array(
				'plan' => 1
			)
		));
		// TBD: What to do with projects?
	}
	public function get_url(){
		global $PAY_SSO;
		if(isset($_REQUEST['lang']) && in_array($_REQUEST['lang'], array('en', 'th'))){
			$lang = $_REQUEST['lang'];
		}else{
			$lang = 'en';
		}
		return $PAY_SSO['callback'].$lang.'/'.$PAY_SSO['app'].'/';
	}
}