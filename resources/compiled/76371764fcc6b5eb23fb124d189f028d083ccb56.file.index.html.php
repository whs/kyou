<?php /* Smarty version Smarty-3.1.3, created on 2012-04-17 19:22:26
         compiled from "resources/templates/index.html" */ ?>
<?php /*%%SmartyHeaderCode:3486634954f8d50c14249d7-09327990%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '76371764fcc6b5eb23fb124d189f028d083ccb56' => 
    array (
      0 => 'resources/templates/index.html',
      1 => 1334660795,
      2 => 'file',
    ),
    '247dda8437ad5cfeb052bd7e011ab80e1b3974ad' => 
    array (
      0 => 'resources/templates/base.html',
      1 => 1334661708,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '3486634954f8d50c14249d7-09327990',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.3',
  'unifunc' => 'content_4f8d50c14c203',
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_4f8d50c14c203')) {function content_4f8d50c14c203($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
	<title>project Kyou</title>
	<link rel="stylesheet" href="/assets/css/bootstrap.min.css">
	<link rel="stylesheet" href="/assets/ui-bootstrap/bootstrap.css">
	<script src="/assets/jquery.js"></script>
	<script src="/assets/underscore.js"></script>
	<script src="/assets/js/bootstrap.min.js"></script>
	<script src="/assets/core.js"></script>
	
<style>
body{
	background: #eee;
}
#lp-in{
	background: white;
	padding: 20px;
	width: 650px;
	margin:  20px auto 20px auto;
}
#lp-in form{
	width: 500px;
	margin: auto;
}
h1{
	margin-bottom: 20px;
	text-align: center;
}
#applist{
	text-align: center;
}
#applist a{
	display: block;
	width: 200px;
	margin: auto;
	text-align: center;
}
#applist .row{
	margin-bottom: 50px;
}
#applist .logo{
	display: block;
	width: 200px;
	height: 200px;
	margin: auto;
	background: #eee;
	margin-bottom: 10px;
}
</style>

</head>
<body>

<div id="lp-in">
	<h1>project Kyou</h1>
	<form action="#" class="form-horizontal">
		<div class="control-group">
			<label class="control-label" for="project">Project</label>
			<div class="controls">
				<select id="project">
					<option>-----------</option>
					<option>New project</option>
				</select>
			</div>
    	</div>
    	<div class="control-group">
    		<div class="controls">
    			<button class="btn btn-primary">Login with menome to share projects</button>
    		</div>
    	</div>
	</form>
	<div id="applist">
		<div class="row">
			<div class="span4">
				<a href="#">
					<span class="logo"></span>
					Page creation
				</a>
			</div>
			<div class="span4">
				<a href="#">
					<span class="logo"></span>
					Binding
				</a>
			</div>
		</div>
		<div class="row">
			<div class="span4">
				<a href="#">
					<span class="logo"></span>
					Applications
				</a>
			</div>
			<div class="span4">
				<a href="#">
					<span class="logo"></span>
					Distribution
				</a>
			</div>
		</div>
	</div>
</div>
<script>
$(function(){
	$("#project").change(function(){

	});
})
</script>

</body>
</html><?php }} ?>