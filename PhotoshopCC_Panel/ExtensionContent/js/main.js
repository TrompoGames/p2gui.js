var isPhotoshop = false;
var csInterface = new CSInterface();
var P2GUI = {};
var sectionHandlers = {};
var currentSection = null;
var host = csInterface.hostEnvironment;
var Minibus = null;
if (host && (host.appId == "PHXS" || host.appId == "PHSP"))
{
	isPhotoshop = true;
}

if (isPhotoshop)
{
	/* load jQuery */
	window.jQuery = require('./lib/jquery-2.1.1.min.js');
	
	/* load the event manager */
	Minibus = require('./lib/minibus.min.js');
	P2GUI.eventManager = Minibus.create();
}

// function to load arbitrary files to the jsx engine //
function loadJSX(fileName)
{
    var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/";
    csInterface.evalScript('$.evalFile("' + extensionRoot + fileName + '")');
}

function validateNumber(evt)
{
	var theEvent = evt || window.event;
	console.log(theEvent.toString());
}

var p2guiEnabled = !isPhotoshop;
var showingSection = null;

// jQuery code //
(function($) {
	
	/* Photoshop specific code */
	if (isPhotoshop)
	{
		/* load foundation */
		$(document).foundation = require('./lib/foundation.min.js');
		
		/* load JSON in the jsx engine */
		loadJSX("lib/json2.js");
		
		/* load the exporter in the jsx engine */
		loadJSX("jsx/Exporter.jsx");
		
		/* get the P2GUI constants from the jsx */
		csInterface.evalScript("bridgeObject(P2GUI)", function(result)
		{
			/* parse the returned object */
			var parsedObject = JSON.parse(result);
			for (var key in parsedObject)
			{
				P2GUI[key] = parsedObject[key];
			}
			
			/* load section handlers */
			sectionHandlers.document = require("./js/document.js");
			sectionHandlers.document = require("./js/element.js");
			sectionHandlers.document = require("./js/export.js");
			
		});
		
		/* initialize event types */
		P2GUI.appEvents = {
			open		: charIDToTypeID("Opn ").toString(),
			make		: charIDToTypeID("Mk  ").toString(),
			del			: charIDToTypeID("Dlt ").toString(),
			select		: charIDToTypeID("slct").toString(),
			move		: charIDToTypeID("move").toString(),
			save		: charIDToTypeID("save").toString(),
			canvasSize	: charIDToTypeID("CnvS").toString(),
			close		: charIDToTypeID("Cls ").toString(),
			duplicate	: charIDToTypeID("Dplc").toString(),
			deselect	: charIDToTypeID("Dslc").toString(),
			cut			: charIDToTypeID("cut ").toString(),
			import		: charIDToTypeID("Impr").toString(),
			merge		: charIDToTypeID("Mrg2").toString(),
			mergeOld	: charIDToTypeID("MrgL").toString(),
			mergeVisible: charIDToTypeID("MrgV").toString(),
			undo		: charIDToTypeID("undo").toString()
		};
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
		
		/* button callbacks */
		$('.button').on('click', Foundation.utils.debounce(function(e)
		{
			var element = $(this);
			var id = element.prop("id");
			if (id && id.length)
			{
				console.log("onClicked_" + id);
				P2GUI.eventManager.emit("onClicked_" + id);
			}
		}, 300, true));
		
		/* checkbox callbacks */
		$("input[type=checkbox]").change(function () {
			var element = $(this);
			var id = element.prop("id");
			var value = (element.prop('checked') ? P2GUI.value.YES : P2GUI.value.NO);
			writeMetaKeyValue(id, value);
			console.log("onChanged_" + id);
			P2GUI.eventManager.emit("onChanged_" + id, value);
		});
		
		/* dropdown callbacks */
		$("select").change(function () {
			var element = $(this);
			var id = element.prop("id");
			var value = element.val();
			writeMetaKeyValue(id, value);
			console.log("onChanged_" + id);
			P2GUI.eventManager.emit("onChanged_" + id, value);
		});
		
		/* input text callbacks */
		var textChanged = function()
		{
			function writeMetadataAndTriggerEvent(key, value)
			{
				writeMetaKeyValue(key, value);
				console.log("onChanged_" + key + "(" + value + ")");
				P2GUI.eventManager.emit("onChanged_" + key, value);
			}
			
			console.log("input[type=text].blur()");
			var element = $(this);
			var key = element.prop("id");
			var value = element.val();
			var functionName = "getLayerProperties";
			if (key.lastIndexOf("P2GUI_doc", 0) === 0 || key.lastIndexOf("P2GUI_exp", 0) === 0)
			{
				functionName = "getDocumentProperties";
			}
			
			var script = "bridgeObject(" + functionName + "(\"" + key + "\"))";
			csInterface.evalScript(script, function(result)
			{
				console.log(script + ": " + result);
				var properties = JSON.parse(result);
				var text = properties[key];
				if (text == P2GUI.value.none)
				{
					text = "";
				}
				
				if (value == P2GUI.value.relativeH)
				{
					csInterface.evalScript("getLayerRelativeHorizontal()", function(result)
					{
						result = parseFloat(result).toFixed(3);
						element.val(result);
						writeMetadataAndTriggerEvent(key, result);
					});
				}
				else if (value == P2GUI.value.relativeV)
				{
					csInterface.evalScript("getLayerRelativeVertical()", function(result)
					{
						result = parseFloat(result).toFixed(3);
						element.val(result);
						writeMetadataAndTriggerEvent(key, result);
					});
				}
				else
				{
					value = encodeURI(value);
					
					if (value != text)
					{
						writeMetadataAndTriggerEvent(key, value);
					}
				}
			});
		};
		
		$("input[type=text]").blur(textChanged);
		$("textarea").blur(textChanged);
		$("input[type=text]").keyup(function(event)
		{
		    if(event.keyCode == 13){
		        textChanged.apply(this);
		    }
		});
		
		reset();
		
		/* bind reset event handlers */
		P2GUI.eventManager.on("onAppEvent_open", reset);
		P2GUI.eventManager.on("onAppEvent_changedDocument", reset);
		
		/* filter the select event */
		var checkDocumentAndLayer = function()
		{
			csInterface.evalScript("updateSelectedDocument()", function(result)
			{
				if (result == "true")
				{
					console.log("onAppEvent_changedDocument");
	        		P2GUI.eventManager.emit("onAppEvent_changedDocument");
				}
				else if (p2guiEnabled)
				{
					csInterface.evalScript("updateSelectedLayer()", function(result)
					{
						if (result == "true")
						{
			        		console.log("onAppEvent_changedLayer");
			        		P2GUI.eventManager.emit("onAppEvent_changedLayer");
						}
					});
				}
			});
		};
		
		P2GUI.eventManager.on("onAppEvent_make", checkDocumentAndLayer);
		P2GUI.eventManager.on("onAppEvent_del", checkDocumentAndLayer);
		P2GUI.eventManager.on("onAppEvent_select", checkDocumentAndLayer);
		P2GUI.eventManager.on("onAppEvent_close", checkDocumentAndLayer);
		P2GUI.eventManager.on("onAppEvent_duplicate", checkDocumentAndLayer);
		P2GUI.eventManager.on("onAppEvent_deselect", checkDocumentAndLayer);
		P2GUI.eventManager.on("onAppEvent_cut", checkDocumentAndLayer);
		P2GUI.eventManager.on("onAppEvent_import", checkDocumentAndLayer);
		P2GUI.eventManager.on("onAppEvent_merge", checkDocumentAndLayer);
		P2GUI.eventManager.on("onAppEvent_mergeOld", checkDocumentAndLayer);
		P2GUI.eventManager.on("onAppEvent_mergeVisible", checkDocumentAndLayer);
		P2GUI.eventManager.on("onAppEvent_undo", checkDocumentAndLayer);
		
		/* register for photoshop events */
		var event = new CSEvent("com.adobe.PhotoshopRegisterEvent", "APPLICATION");
		event.extensionId = "com.trompogames.P2GUIPanel";
		var eventIDs = "";
		for (var key in P2GUI.appEvents)
		{
			if (eventIDs.length > 0)
			{
				eventIDs += ",";
			}
			eventIDs += P2GUI.appEvents[key];
		}
		
		event.data = eventIDs;
		csInterface.dispatchEvent(event);
		csInterface.addEventListener("PhotoshopCallback", function(csEvent)
		{
			csInterface.evalScript("isExporting()", function(result)
			{
				if (result == "false")
				{
					var dataArray = csEvent.data.split(",");
					var eventID = dataArray[0].toString();
					for(var key in P2GUI.appEvents)
					{
					    if(P2GUI.appEvents.hasOwnProperty(key))
					    {
					        if(P2GUI.appEvents[key] === eventID)
					        {
					        	if (p2guiEnabled || eventID == P2GUI.appEvents.open || eventID == P2GUI.appEvents.select)
					        	{
					        		console.log("onAppEvent_" + key);
					        		P2GUI.eventManager.emit("onAppEvent_" + key);
					        	}
					        }
					    }
					}
				}
			});
		});
	});
	

	function showSection(section) {
		var element = $(section);
		element.show().siblings().hide()
		$('.off-canvas-wrap, .inner-wrap, .main-section, .main-content').height("100%");
		callEnterFunction(section);
	}
	
	function callEnterFunction(section)
	{
		var sectionName = section.substr(section.indexOf('#') + 1, section.length);
		if (sectionName != currentSection && P2GUI.eventManager)
		{
			if (currentSection != null)
			{
				console.log("onExit_" + currentSection);
				P2GUI.eventManager.emit("onExit_" + currentSection);
			}
			currentSection = sectionName;
			console.log("onEnter_" + sectionName);
			P2GUI.eventManager.emit("onEnter_" + sectionName);
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
					$('#p2guiDisabledModal').foundation('reveal', 'close');
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
	
	/* metadata */
	function updateMetadataAndGUI(reference, defaults)
	{
		if (isPhotoshop)
		{
			var getFunctionName = null;
			var setFunctionName = null;
			
			var isDocumentSection = false;
			for(var key in P2GUI.document)
			{
			    if(P2GUI.document.hasOwnProperty(key))
			    {
			        if(P2GUI.document[key] === reference) {
			        	isDocumentSection = true;
			        }
			    }
			}
			
			for(var key in P2GUI.exporter)
			{
			    if(P2GUI.exporter.hasOwnProperty(key))
			    {
			        if(P2GUI.exporter[key] === reference) {
			        	isDocumentSection = true;
			        }
			    }
			}
			
			if (isDocumentSection)
			{
				getFunctionName = "getDocumentProperties";
				setFunctionName = "setDocumentProperties";
			}
			else
			{
				getFunctionName = "getLayerProperties";
				setFunctionName = "setLayerProperties";
			}
			
			var args = propertyQueryFromObject(reference);
			var script = "bridgeObject(" + getFunctionName + "(" + args + "))"
			csInterface.evalScript(script, function(result)
			{
				console.log(script + ": " + result);
				var properties = JSON.parse(result);
				properties = updateHTMLGUI(properties, reference, defaults);
				
				if (properties != null)
				{
					var args = propertyAssignFromObject(properties);
					csInterface.evalScript(setFunctionName + "(" + args + ")");
				}
			});
		}
	}
	
	this.updateMetadataAndGUI = updateMetadataAndGUI;
	
	
	/* GUI tools */
	function updateHTMLGUI(properties, reference, defaults)
	{
		var needsUpdate = false;
		
		for (var field in reference)
		{
			var triggerSyncEvent = true;
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
					
					if (value == P2GUI.value.layerName)
					{
						delete properties[key];
						triggerSyncEvent = false;
						layerNameToHTML(htmlObject, key);
					}
					else
					{
						htmlObject.val(decodeURI(value));
					}
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
			else if (htmlTag == "TEXTAREA")
			{
				if (value == P2GUI.value.none)
				{
					value = "";
				}
				
				if (value == P2GUI.value.layerName)
				{
					delete properties[key];
					triggerSyncEvent = false;
					layerNameToHTML(htmlObject, key);
				}
				else
				{
					htmlObject.val(decodeURI(value));
				}
			}
			else
			{
				nativeAlert("Unknown HTML tag: " + htmlTag);
			}
			
			/* trigger an onChanged event for every field (to update custom GUI elements) */
			if (triggerSyncEvent)
			{
				P2GUI.eventManager.emit("onChanged_" + key, value);
			}
		}
		
		if (needsUpdate)
		{
			return properties;
		}
		
		return null;
	}
	
	function layerNameToHTML(htmlObject, key)
	{
		csInterface.evalScript("getLayerName()", function(result)
		{
			htmlObject.val(result);
			P2GUI.eventManager.emit("onChanged_" + key, result);
			var property = htmlObject.prop("id");
			var value = encodeURI(result);
			writeMetaKeyValue(property, value);
		});
	}
	
	
	/* JSX tools */
	function charIDToTypeID(keyword)
	{
		var value = 0;
		value  = keyword.charCodeAt(0) * 256 * 256 * 256;
		value += keyword.charCodeAt(1) * 256 * 256;
		value += keyword.charCodeAt(2) * 256;
		value += keyword.charCodeAt(3);
		return value;
	}
	
	function writeMetaKeyValue(key, value)
	{
		var functionName = "setLayerProperties";
		if (key.lastIndexOf("P2GUI_doc", 0) === 0  || key.lastIndexOf("P2GUI_exp", 0) === 0)
		{
			functionName = "setDocumentProperties";
		}
		
		if (value === "")
		{
			value = P2GUI.value.none;
		}
		
		var script = functionName + "(\"" + key + "\",\"" + value + "\")";
		console.log(script);
		csInterface.evalScript(script);
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
	
	function nativeAlert(string)
	{
		csInterface.evalScript("showAlert(\"" + string + "\")");
	}
	
	this.nativeAlert = nativeAlert;
	
})(window.jQuery);


/* utf8 encoder */
var Utf8 = {
		 
    // public method for url encoding
    encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
 
        for (var n = 0; n < string.length; n++) {
 
            var ch = string.charCodeAt(n);
			 
			if (ch < 128)
			{
				utftext += String.fromCharCode(ch);
			}
			else if (ch <= 2047)
			{
				utftext += String.fromCharCode(192 + (ch / 64));
				utftext += String.fromCharCode(128 + (ch % 64));
			}
			else if (ch <= 65535)
			{
				utftext += String.fromCharCode(224 + (ch / 4096));
				utftext += String.fromCharCode(128 + ((ch / 64) % 64));
				utftext += String.fromCharCode(128 + (ch % 64));
			}
			else if (ch <= 2097151)
			{
				utftext += String.fromCharCode(240 + (ch / 262144));
				utftext += String.fromCharCode(128 + ((ch / 4096) % 64));
				utftext += String.fromCharCode(128 + ((ch / 64) % 64));
				utftext += String.fromCharCode(128 + (ch % 64));
			}
			else if (ch <=67108863)
			{
				utftext += String.fromCharCode(248 + (ch / 16777216));
				utftext += String.fromCharCode(128 + ((ch / 262144) % 64));
				utftext += String.fromCharCode(128 + ((ch / 4096) % 64));
				utftext += String.fromCharCode(128 + ((ch / 64) % 64));
				utftext += String.fromCharCode(128 + (ch % 64));
			}
			else if (ch <=2147483647)
			{
				utftext += String.fromCharCode(252 + (ch / 1073741824));
				utftext += String.fromCharCode(128 + ((ch / 16777216) % 64));
				utftext += String.fromCharCode(128 + ((ch / 262144) % 64));
				utftext += String.fromCharCode(128 + ((ch / 4096) % 64));
				utftext += String.fromCharCode(128 + ((ch / 64) % 64));
				utftext += String.fromCharCode(128 + (ch % 64));
			}                                       
        }
		return utftext;
    }
}


