<?php
define("SITE_KEY", 'x8fxbbx02xe7x11Ra!x92Hxffxvxd5xc1xa6Tx08TGw`xa3x06xadx85sGx07x93xb3x0bxd5x16Yx0cxbbu4xfaxaexb8x86bxdaxdb#x04Q\\$x96x04xafxd4xecx1cf:xd1\'xe0x16xd5xbdxbexaanxc7x88rxa8xcfxfe=x9a1x9cxbebxf4bxd4x94=x98Gx90=x14xe4xcexc2xa7x97xdexfexe9Kaxe8`x12D,x89(x9bxddXx9cx96xd3x8bxf5x80_Cxe9x1fxbfx81]uxbe-txd2BIx9dxafxc7hxfcrxd7xfexff%x91vq6xd6xb6xa6xc3*xe8xf1xffxf2 Ux08ng)xaftxe4x9exe0x90xcdxe2Z}x9ex81xc0x161j\\$x87  xa2X*/x0excfx04xd88\\$/x10gxd6vxe02xb0xbcx85xd0txb0,Xxb6xcfL`xcdNxe2bxb9Rx8aSHx1cxba1Bxdbxa0x04x9dhxfex11xd1xc8xa7Y-pW0x028xb6xa5+x08xccxa5xd3xc4x96vx10xc6xbdx89xd7xb1xf9x97xac');

$MONGO = new Mongo("mongodb://kyou:kyou@localhost/kyou");
$DB = $MONGO->kyou;
ini_set('display_errors','On');
// XXX: Remove E_STRICT after backbone.class.php have been rewrote
error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT);