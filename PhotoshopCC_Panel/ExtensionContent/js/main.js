var isPhotoshop = false;
var csInterface = new CSInterface();
var host = csInterface.hostEnvironment;
if (host && (host.appId == "PHXS" || host.appId == "PHSP"))
{
	isPhotoshop = true;
}

if (isPhotoshop)
{
	window.jQuery = require('./lib/jquery-2.1.1.min.js');
}

var p2guiEnabled = !isPhotoshop;

// jQuery code //
(function($) {
	
	if (isPhotoshop)
	{
		$(document).foundation = require('./lib/foundation.min.js');
	}

	$(document).ready(function() {
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

		$('ul.off-canvas-list li a').on('click', function(e) {
			var currentAttrValue = $(this).attr('href');

			// Show/Hide Tabs
			showSection('.main-content ' + currentAttrValue);
			$('.current-section').text($(this).text());

			e.preventDefault();
		});

		$(document).on('open.fndtn.offcanvas', '[data-offcanvas]', function() {
			var off_canvas_wrap = $(this);
			if (!p2guiEnabled) {
				off_canvas_wrap.foundation('offcanvas', 'close', 'move-right');
			}
		});
		
		$('#activate-p2gui-button').on('click', Foundation.utils.debounce(function(e)
		{
			activateP2GUI();	
		}, 300, true));
		
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
	
	enterFunctionTable.document_configuration_enter = function()
	{
		if (isPhotoshop)
		{
			csInterface.evalScript("sayHello()", alertJSXResult);
		}
	}
	
	
	// JSX tools //
	function alertJSXResult(result)
	{
		alert(result);
	}
	
	function nativeAlert(string)
	{
		csInterface.evalScript("showAlert(\"" + string + "\")");
	}
	
})(jQuery);

// ul.off-canvas-list li a
