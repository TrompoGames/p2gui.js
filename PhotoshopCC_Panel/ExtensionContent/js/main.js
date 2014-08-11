var isPhotoshop = false;
var csInterface = new CSInterface();
var P2GUI = {};
var host = csInterface.hostEnvironment;
if (host && (host.appId == "PHXS" || host.appId == "PHSP"))
{
	isPhotoshop = true;
}

if (isPhotoshop)
{
	window.jQuery = require('./lib/jquery-2.1.1.min.js');
}

// function to load arbitrary files to the jsx engine //
function loadJSX(fileName)
{
    var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/";
    csInterface.evalScript('$.evalFile("' + extensionRoot + fileName + '")');
}

var p2guiEnabled = !isPhotoshop;
var showingSection = null;

// jQuery code //
(function($) {
	
	/* Photoshop specific code */
	if (isPhotoshop)
	{
		$(document).foundation = require('./lib/foundation.min.js');
		// load JSON in the jsx engine //
		loadJSX("lib/json2.js");
		// get the P2GUI constants from the jsx //
		csInterface.evalScript("bridgeObject(P2GUI)", function(result)
		{
			P2GUI = JSON.parse(result);
		});
	}

	/* document ready callback */
	$(document).ready(function() {
		
		/* load foundation */
		$(document).foundation({
			offcanvas : {
				// Sets method in which offcanvas opens.
				// [ move | overlap ]
				open_method : 'move',
				// Should the menu close when a menu link is clicked?
				// [ true | false ]
				close_on_click : true
			}
		});
		
		/* show the correct section based on the menu selection */
		$('ul.off-canvas-list li a').on('click', function(e) {
			var currentAttrValue = $(this).attr('href');

			// Show/Hide Tabs
			showSection('.main-content ' + currentAttrValue);
			$('.current-section').text($(this).text());

			e.preventDefault();
		});

		/* if somehow the menu button is pressed when P2GUI is disabled, ignore the command */
		$(document).on('open.fndtn.offcanvas', '[data-offcanvas]', function() {
			var off_canvas_wrap = $(this);
			if (!p2guiEnabled && isPhotoshop) {
				off_canvas_wrap.foundation('offcanvas', 'close', 'move-right');
			}
		});
		
		/* activate P2GUI button event */
		$('#activate-p2gui-button').on('click', Foundation.utils.debounce(function(e)
		{
			activateP2GUI();
		}, 300, true));
		
		/* checkbox callbacks */
		$("input[type=checkbox]").change(function () {
			var element = $(this);
			writeMetaKeyValue(element.prop("id"), (element.prop('checked') ? P2GUI.value.YES : P2GUI.value.NO));
		});
		
		/* dropdown callbacks */
		$("select").change(function () {
			var element = $(this);
			writeMetaKeyValue(element.prop("id"), element.val());
		});
		
		/* input text callbacks */
		$("input[type=text]").blur(function()
		{
			var element = $(this);
			var key = element.prop("id");
			var value = element.val();
			var functionName = "getLayerProperties";
			if (key.lastIndexOf("P2GUI_doc", 0) === 0)
			{
				functionName = "getDocumentProperties";
			}
			
			csInterface.evalScript("bridgeObject(" + functionname + "(\"" + key + "\"))", function(result)
			{
				nativeAlert(result);
				var properties = JSON.parse(result);
				var text = properties[key];
				if (text == P2GUI.value.none)
				{
					text = "";
				}
				
				if (value != text)
				{
					writeMetaKeyValue(key, value);
				}
			});
		});
		
		reset();
	});
	

	function showSection(section) {
		var element = $(section);
		element.show().siblings().hide()
		$('.off-canvas-wrap, .inner-wrap, .main-section, .main-content')
				.height("100%");
		callEnterFunction(section);
	}
	
	function callEnterFunction(section)
	{
		var sectionName = section.substr(section.indexOf('#') + 1, section.length); 
		var enterFunction = enterFunctionTable[sectionName + "_enter"];
		if(typeof enterFunction === 'function')
		{
			enterFunction.call(this);
		}
	}

	function reset() {
		showSection('.main-content #detecting-p2gui');
		$('.current-section').text("P2GUI Toolkit");
		p2guiEnabled = false;
		detectP2GUI();
	}

	function detectP2GUI() {
		// code //
		if (isPhotoshop)
		{
			csInterface.evalScript("isP2GUIEnabled()", function(result)
			{
				p2guiEnabled = (result === 'true');
				if (p2guiEnabled) {
					showSection('.main-content #document_configuration');
					$('.current-section').text("Configuration");
				} else {
					$('#p2guiDisabledModal').foundation('reveal', 'open');
				}				
			});
		}
	}
	
	function activateP2GUI()
	{
		csInterface.evalScript("enableP2GUI()", function(result)
		{
			p2guiEnabled = (result === 'true');
			if (p2guiEnabled)
			{
				showSection('.main-content #document_configuration');
				$('.current-section').text("Configuration");
				$('#p2guiDisabledModal').foundation('reveal', 'close');
			}
			else
			{
				nativeAlert("ERROR: Could not enable P2GUI on this file");
			}
		});
	}
	
	// Enter functions //
	var enterFunctionTable = enterFunctionTable || {};
	
	// document --> configuration //
	enterFunctionTable.document_configuration_enter = function()
	{
		if (isPhotoshop)
		{
			var args = propertyQueryFromObject(P2GUI.document.configuration);
			csInterface.evalScript("bridgeObject(getDocumentProperties(" + args + "))", function(result)
			{
				var properties = JSON.parse(result);
				properties = updateHTMLGUI(properties, P2GUI.document.configuration, P2GUI.document.configurationDefaults);
				
				if (properties != null)
				{
					var args = propertyAssignFromObject(properties);
					csInterface.evalScript("setDocumentProperties(" + args + ")");
				}
			});
		}
	}
	
	// GUI tools //
	function updateHTMLGUI(properties, reference, defaults)
	{
		var needsUpdate = false;
		
		for (var field in reference)
		{
			var key = reference[field];
			var value = properties[key];
			if (typeof value === 'undefined' || value == null)
			{
				needsUpdate = true;
				value = defaults[field];
				properties[key] = value;
			}
			
			var htmlObject = $("#" + key);
			var htmlTag = htmlObject.prop('tagName');

			if (htmlTag == "INPUT")
			{
				var type = htmlObject.prop('type');
				if (type == "text")
				{
					if (value == P2GUI.value.none)
					{
						value = "";
					}
					htmlObject.val(value);
				}
				else if (type == "checkbox")
				{
					htmlObject.prop('checked', (value == P2GUI.value.YES));
				}
			}
			else if (htmlTag == "SELECT")
			{
				htmlObject.val(value);
			}
			else
			{
				nativeAlert("Unknown HTML tag: " + htmlTag);
			}
		}
		
		if (needsUpdate)
		{
			return properties;
		}
		
		return null;
	}
	
	
	// JSX tools //
	function writeMetaKeyValue(key, value)
	{
		var functionName = "setLayerProperties";
		if (key.lastIndexOf("P2GUI_doc", 0) === 0)
		{
			functionName = "setDocumentProperties";
		}
		
		if (value === "")
		{
			value = P2GUI.value.none;
		}
		
		csInterface.evalScript(functionName + "(\"" + key + "\",\"" + value + "\")");
	}
	
	function propertyQueryFromObject(obj)
	{
		var str = "";
		for (var property in obj)
		{
			if (str.length > 0)
			{
				str += ",";
			}
			str += "\"" + obj[property] + "\"";
		}
		
		return str;
	}
	
	function propertyAssignFromObject(obj)
	{
		var str = "";
		for (var property in obj)
		{
			if (str.length > 0)
			{
				str += ",";
			}
			var value = obj[property];
			if (value === "")
			{
				value = P2GUI.value.none;
			}
			
			str += "\"" + property + "\",\"" + value + "\"";
		}
		
		return str;
	}
	
	function alertJSXResult(result)
	{
		alert(result);
	}
	
	function nativeAlert(string)
	{
		csInterface.evalScript("showAlert(\"" + string + "\")");
	}
	
})(jQuery);
