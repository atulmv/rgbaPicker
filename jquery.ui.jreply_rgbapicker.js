/*
 * jQuery UI RGBA ColorPicker
 *
 * Copyright (c) 2013 jReply LLC http://jreply.com
 * Licensed under the terms of the MIT license - http://opensource.org/licenses/MIT
 *
 * RGBA color picker with 
 * 1. a simple point & click interface
 * 2. the ability to store up to 8 color values as named presets
 *
 * Sample usage:See the code in index.html
 *
 * Typically, in response to a user generated event; e.g. a button click;
 * do $('<div>').jreply_rgbapicker(options);
 * Options is the configuration object with the following attributes
 * 1. caption - the title for the RGBA color picker dialog
 * 2. rgba - the initial RGBA color value, e.g. 23,153,19,1
 * 3. callback - a callback function to handle the color assignment
 *
 * The callback function, if provided, gets the new RGBA value
 * as the string rgba(r,g,b,a)
 *
 * Typically you would use the callback to update a color display
 * somewhere in your application
 *
 * The default color picker image, rainbow.png, may be replaced to 
 * provide a bigger base of predefined colors that the user may
 * choose from.
*/

//utility functions & methods
String.prototype.jrp_reverse=function(){return this.split("").reverse().join("");}

String.prototype.jrp_format = function (args)
{
 var newStr = this;
 for (var key in args){newStr = newStr.replace('{' + key + '}', args[key]);}
 return newStr;
}

function jrp_sprintf()
{
 /*
  This routine comes from http://phpjs.org/functions/sprintf/.
  Original by Ash Searle (http://hexmen.com/blog/)
  Improved by 
  
  Kevin van Zonneveld http://kevin.vanzonneveld.net
  Brett Zamir (http://brett-zamir.me)
  Michael White (http://getsprink.com)
  Allidylls,Dj
 */
  var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g;
  var a = arguments,
    i = 0,
    format = a[i++];

  // pad()
  var pad = function (str, len, chr, leftJustify) {
    if (!chr) {
      chr = ' ';
    }
    var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
    return leftJustify ? str + padding : padding + str;
  };

  // justify()
  var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
    var diff = minWidth - value.length;
    if (diff > 0) {
      if (leftJustify || !zeroPad) {
        value = pad(value, minWidth, customPadChar, leftJustify);
      } else {
        value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
      }
    }
    return value;
  };

  // formatBaseX()
  var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
    // Note: casts negative numbers to positive ones
    var number = value >>> 0;
    prefix = prefix && number && {
      '2': '0b',
      '8': '0',
      '16': '0x'
    }[base] || '';
    value = prefix + pad(number.toString(base), precision || 0, '0', false);
    return justify(value, prefix, leftJustify, minWidth, zeroPad);
  };

  // formatString()
  var formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
    if (precision != null) {
      value = value.slice(0, precision);
    }
    return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
  };

  // doFormat()
  var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
    var number;
    var prefix;
    var method;
    var textTransform;
    var value;

    if (substring == '%%') {
      return '%';
    }

    // parse flags
    var leftJustify = false,
      positivePrefix = '',
      zeroPad = false,
      prefixBaseX = false,
      customPadChar = ' ';
    var flagsl = flags.length;
    for (var j = 0; flags && j < flagsl; j++) {
      switch (flags.charAt(j)) {
      case ' ':
        positivePrefix = ' ';
        break;
      case '+':
        positivePrefix = '+';
        break;
      case '-':
        leftJustify = true;
        break;
      case "'":
        customPadChar = flags.charAt(j + 1);
        break;
      case '0':
        zeroPad = true;
        break;
      case '#':
        prefixBaseX = true;
        break;
      }
    }

    // parameters may be null, undefined, empty-string or real valued
    // we want to ignore null, undefined and empty-string values
    if (!minWidth) {
      minWidth = 0;
    } else if (minWidth == '*') {
      minWidth = +a[i++];
    } else if (minWidth.charAt(0) == '*') {
      minWidth = +a[minWidth.slice(1, -1)];
    } else {
      minWidth = +minWidth;
    }

    // Note: undocumented perl feature:
    if (minWidth < 0) {
      minWidth = -minWidth;
      leftJustify = true;
    }

    if (!isFinite(minWidth)) {
      throw new Error('sprintf: (minimum-)width must be finite');
    }

    if (!precision) {
      precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : undefined;
    } else if (precision == '*') {
      precision = +a[i++];
    } else if (precision.charAt(0) == '*') {
      precision = +a[precision.slice(1, -1)];
    } else {
      precision = +precision;
    }

    // grab value using valueIndex if required?
    value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

    switch (type) {
    case 's':
      return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
    case 'c':
      return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
    case 'b':
      return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
    case 'o':
      return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
    case 'x':
      return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
    case 'X':
      return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
    case 'u':
      return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
    case 'i':
    case 'd':
      number = +value || 0;
      number = Math.round(number - number % 1); // Plain Math.round doesn't just truncate
      prefix = number < 0 ? '-' : positivePrefix;
      value = prefix + pad(String(Math.abs(number)), precision, '0', false);
      return justify(value, prefix, leftJustify, minWidth, zeroPad);
    case 'e':
    case 'E':
    case 'f': // Should handle locales (as per setlocale)
    case 'F':
    case 'g':
    case 'G':
      number = +value;
      prefix = number < 0 ? '-' : positivePrefix;
      method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
      textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
      value = prefix + Math.abs(number)[method](precision);
      return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
    default:
      return substring;
    }
  };

  return format.replace(regex, doFormat);
}



function jrp_findPos(obj)
{
 var curleft = 0, curtop = 0;
 if (obj.offsetParent) 
 {
  do
	 {
    curleft += obj.offsetLeft;
    curtop += obj.offsetTop;
   } while (obj = obj.offsetParent);
  return {x:curleft,y:curtop};
 }
 return undefined;
}
//***** Dialog Markup Generation
function jrp_Markup()
{
 /*
  The markup for the RGBA color picker dialog is generated here, on-the-fly.
  Styling comes from ui.jreply_rgbapicker.css
  Note the use of the jrp_ prefix on all HTML element id attributes and all styles
  In the event of a naming conflict with a global search & replace for jrp_ 
  in this file and in ui.jreply_rgbapicker.css might provide a fix
 */
 var markup = 
 ["<div id='jrp_ColorPicker' style='display:none;font-size:0.8em'>",
  "<div style='clear:both'>",
  "<div class='jrp_democolordiv jrp_topfloat'>",
  "<div id='jrp_cpsample' class='jrp_cpsample' title='Color Preview. Chequered Background = Translucent color'>",
  "&nbsp;</div></div>",
  "<input id='jrp_inpRGBDirect' class='jrp_cpsample jrp_topfloat' style='text-transform:uppercase;margin-top:4px;' title='Edit RGB color' placeholder='RGB Color' maxlength='6'/>",
  "</div>",
  "<div id='jrp_colorpre_outer' class='jrp_divcolorpre'>",
  "<div id='jrp_colorpre_inner' style='clear:left'>",
  "<div class='jrp_preset' id='jrp_0'>&nbsp;</div>",
  "<div class='jrp_preset' id='jrp_1'>&nbsp;</div>",
  "<div class='jrp_preset' id='jrp_2'>&nbsp;</div>",
  "<div class='jrp_preset' id='jrp_3'>&nbsp;</div>",
  "<div class='jrp_preset' id='jrp_4'>&nbsp;</div>",
  "<div class='jrp_preset' id='jrp_5'>&nbsp;</div>",
  "<div class='jrp_preset' id='jrp_6'>&nbsp;</div>",
  "<div class='jrp_preset' id='jrp_7' style='clear:right'>&nbsp;</div>",
  "</div>",
  "<input id='jrp_inpColorPre' class='jrp_direct' title='Enter a name to save the current color as a preset' placeholder='Preset Name'/>",
  "</div>",
  "<canvas id='jrp_canvas' width='470' height='328' style='cursor:pointer;margin:6px' title='Click on a color block or the black/white background to select that color'></canvas>",
  "<div  id='jrp_divAlpha' style='margin-top:5px' title='Color Opacity'></div>", 
  "<input id='jrp_inpRGBNow' type='hidden'/></div>"];
  return markup.join("\n");
}
//******* Initial RGBA Dialog configuration
function jrp_config(opts)
{
 var img = new Image();
 var ctx = $('#jrp_canvas').get(0).getContext('2d');
 img.onload = function(){ctx.drawImage(img,0,0);img = null};
 img.src = 'rainbow.png';
 
 $('#jrp_canvas').click(function(e){jrp_ccpClick(e)});
 //canvas click handler - gets & uses RGB of the canvas click location
 $('#jrp_inpRGBDirect').keyup(function(){jrp_updateRGBDirect()});
 //responds to direct keyboard input of RGB values
 $('#jrp_divAlpha').slider({orientation:"horizontal",min:0,max:100,slide:jrp_refreshSwatch,change:jrp_refreshSwatch});
 //handles changes in opacity
 
 var p = opts.rgba.split(',');
 //opts.rgba has the initial color setting
  
 $('#jrp_inpRGBNow').data('rgba',JSON.stringify(p));
 //store current color for later use
 $('#jrp_divAlpha').slider('value',parseFloat(p[3])*100);
 /*
  The alpha value in RGBA goes from 0 to 1.
  The slider ranges from 0 to 100. Here we convert
 */
 var rgb = jrp_sprintf("%02x",p[0]) + jrp_sprintf("%02x",p[1]) + jrp_sprintf("%02x",p[2]);
 //convert the RGB value to an HTML style hexadecimal string
 $('#jrp_inpRGBDirect').val(rgb);
 jrp_updateDemoColor(p.join(','));
 
 var canLocal = ('object' == typeof(window.localStorage));//do we have localStorage?
 var displ = (canLocal)?'block':'none';
 $('#jrp_colorpre_outer').css('display',displ);
 if (canLocal)
 {
  $('.jrp_preset').click(function(event){jrp_assignPreset(event.target);});
  //click handler for preset color boxes
  var presets = localStorage.getItem('jrp_presets');
  if (null == presets) jrp_pre = new Array();else jrp_pre = jQuery.parseJSON(presets);
  //build or rebuild array of color preset objects
  jrp_refreshColorPresets();
  //display current color presets
 }
}
//***** Internal Routines
function jrp_ccpClick(e)
{
/*
 Find the click position on the canvas
 Get the RGB value at that point
 Build it into a hexadecimal string
 Display that string in the direct input box
 Get the Alpha value from the slider - note /100!
 Pack the R,G,B & A values into an array
 Update the color preview
 Store for later use
*/
 var pos = jrp_findPos($('#jrp_canvas').get(0));
 if (undefined == pos) return;
 var x = e.pageX - pos.x;
 var y = e.pageY - pos.y;
 var ctxt = $('#jrp_canvas').get(0).getContext('2d');
 var p = ctxt.getImageData(x,y,1,1).data; 
 var rgb = jrp_sprintf("%02x",p[0]) + jrp_sprintf("%02x",p[1]) + jrp_sprintf("%02x",p[2]);
 $('#jrp_inpRGBDirect').val(rgb);
 var alpha = $('#jrp_divAlpha').slider('value')/100;
 p = new Array(p[0],p[1],p[2],alpha);
 jrp_updateDemoColor(p.join(','));
 p = JSON.stringify(p);
 $('#jrp_inpRGBNow').data('rgba',p);
}

function jrp_refreshSwatch()
{
 p = $('#jrp_inpRGBNow').data('rgba');
 p = jQuery.parseJSON(p);
 p[3] = $('#jrp_divAlpha').slider('value')/100;
 jrp_updateDemoColor(p.join(','));
 p = JSON.stringify(p);
 $('#jrp_inpRGBNow').data('rgba',p);
}

function jrp_updateRGBDirect()
{
 var rgb = $('#jrp_inpRGBDirect').val();
 var re = /[0-9a-fA-F]{6}/g;
/*
 First we test that the entered value is a valid 6 char hexadecimal string
 Next we get the R, G & B parts into an array
 Convert the hexadecimal values to integers
 Get the Alpha value from the slider - note /100!
 Build a new array with these R,G,B & A values
 Update the color preview
 Store this RGBA value for later use
*/
 if (re.test(rgb))
 {
  var p = rgb.match(/.{1,2}/g);
  for(var i=0;i < 3;i++) p[i] = parseInt('0x' + p[i]);
  var alpha = $('#jrp_divAlpha').slider('value')/100;
  p = new Array(p[0],p[1],p[2],alpha);
  jrp_updateDemoColor(p.join(','));
  p = JSON.stringify(p);
  $('#jrp_inpRGBNow').data('rgba',p);
 }
}

function jrp_updateDemoColor(rgba)
{
 //updates the displayed color
 rgba = 'rgba(' + rgba + ')';
 $('#jrp_cpsample').css('backgroundColor',rgba);
}
//********** Preset Color Management
function jrp_assignPreset(tgt)
{
 var ndx = parseInt($(tgt).attr('id').jrp_reverse());
 if (ndx >= jrp_pre.length) return;
 
 clr = jrp_pre[ndx];
 $('#jrp_inpColorPre').val(clr.n);
 var p = clr.c;
  
 $('#jrp_inpRGBNow').data('rgba',JSON.stringify(p));
 $('#jrp_divAlpha').slider('value',parseFloat(p[3])*100);
 var rgb = jrp_sprintf("%02x",p[0]) + jrp_sprintf("%02x",p[1]) + jrp_sprintf("%02x",p[2]);
 $('#jrp_inpRGBDirect').val(rgb);
 jrp_updateDemoColor(p.join(','));
}

function jrp_refreshColorPresets()
{
 $('.jrp_preset').css('backgroundColor','').attr('title','No preset assigned');
 var len = jrp_pre.length;
 for(var i=0;i < len;i++)
 {
  var clr = jrp_pre[i];
  var klr = 'rgba({cc})'.jrp_format({cc:clr.c});
  $('#jrp_' + i).attr('title',clr.n).css('backgroundColor',klr);
 }
}

function jrp_addToColorsPreset(rgba,colorName)
{
 if ('undefined' == typeof(window.localStorage)) return;
 //no local storage so do nothing
 var ndx = jrp_pre.length;
 for (var i=0;i < ndx;i++) ndx = (colorName == jrp_pre[i].n)?i:ndx;
 var newColor = {"n":colorName,"c":rgba};
 if (ndx < jrp_pre.length) jrp_pre[ndx] = newColor;else 
 {
  if (8 == ndx) jrp_pre.shift();
  jrp_pre.push(newColor);
 } 
 
 localStorage.setItem('jrp_presets',JSON.stringify(jrp_pre));
}

function jreply_rgba_apply(cbk)
{
 if (null != cbk)
 {
  var rgba = $('#jrp_inpRGBNow').data('rgba');
  rgba = jQuery.parseJSON(rgba);
  
  var colorName = $('#jrp_inpColorPre').val();
  var pre_rgba = rgba.join(',');
  if (0 < colorName.length) jrp_addToColorsPreset(rgba,colorName);

  rgba = 'rgba(' + rgba.toString() + ')';
  cbk(rgba);
  $('#jrp_ColorPicker').dialog('destroy');
 } 
}

function jrp_cleanup()
{
 deletejrp_pre;
 //discard the presets array
}


(function($)
{
 $.widget("ui.jreply_rgbapicker",
 {
  options:{caption:'RGBA Color Picker',rgba:'23,153,19,1',callback:null},
  _create:function()
  {
   var self = this;
   var opts = self.options;

   var markup = jrp_Markup();
   var btns = {Apply:function(){jreply_rgba_apply(opts.callback)},
               Cancel:function(){$('#jrp_ColorPicker').dialog('destroy')}};
   $(markup).dialog({height:'auto',width:'500',dialogClass:'jrp_noclose',buttons:btns,
                     create:function(){jrp_config(opts);},beforeClose:jrp_cleanup,
					 title:opts.caption});
  }
 });
})(jQuery);

