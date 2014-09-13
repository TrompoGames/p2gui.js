//------------///////////////////////////////////------------//
//------------//////////// CONSTANTS ////////////------------//
//------------///////////////////////////////////------------//
var P2GUI = {
	/* global */
	namespace 		: "http://p2gui.trompogames.com/1.0.0",
	namespacePrefix	: "p2gui:",
	enabled			: "P2GUIEnabled",
	
	/* values */
	value			: {
		YES			: "P2GUI_YES",
		NO			: "P2GUI_NO",
		none		: "P2GUI_none",
		custom		: "P2GUI_custom",
		cocos2d		: "P2GUI_cocos2d",
		pixijs		: "P2GUI_pixi.js",
		layerName	: "P2GUI_layerName",
		absolute	: "P2GUI_absolute",
		relative	: "P2GUI_relative",
		snap		: "P2GUI_snap",
		left		: "P2GUI_left",
		right		: "P2GUI_right",
		leftRight	: "P2GUI_leftRight",
		top			: "P2GUI_top",
		bottom		: "P2GUI_bottom",
		topBottom	: "P2GUI_topBottom",
		relativeH	: "P2GUI_relative_horizontal",
		relativeV	: "P2GUI_relative_vertical",
		exportAll	: "P2GUI_exportAll",
		onlyBasic	: "P2GUI_onlyBasic"
	},

	/* document */
	document		: {
		/* configuration */
		configuration	: {
			exportJsonName			: "P2GUI_doc_config_exportJsonName",
			autoClassType			: "P2GUI_doc_config_autoClassType",
			classFieldsType			: "P2GUI_doc_config_classFieldsType",
			humanReadable			: "P2GUI_doc_config_humanReadable",
			exportJsonPath			: "P2GUI_doc_config_exportJsonPath",
			exportImagePath			: "P2GUI_doc_config_exportImagePath",
			autoClassDescriptor		: "P2GUI_doc_config_autoClassDescriptor",
			classFieldsDescriptor	: "P2GUI_doc_config_classFieldsDescriptor",
		},
	},
	
	/* element */
	element			: {
		/* information */
		information		: {
			name					: "P2GUI_obj_info_name",
			id						: "P2GUI_obj_info_id",
			className				: "P2GUI_obj_info_class",
			misc					: "P2GUI_obj_info_misc",
		},
		
		/* layout */
		layout			: {
			horizontalPosition		: "P2GUI_obj_layout_hPosition",
			verticalPosition		: "P2GUI_obj_layout_vPosition",
			horizontalSnapTo		: "P2GUI_obj_layout_hSnapTo",
			verticalSnapTo			: "P2GUI_obj_layout_vSnapTo",
			horizontalRelative		: "P2GUI_obj_layout_hRelative",
			verticalRelative		: "P2GUI_obj_layout_vRelative",
			maintainRelativeScale	: "P2GUI_obj_layout_relativeScale",
		},
		
		/* export options */
		exportOptions	: {
			exportPNG				: "P2GUI_obj_exportConfig_exportPNG",
			exportJSON				: "P2GUI_obj_exportConfig_exportJSON",
			ignoreChildren			: "P2GUI_obj_exportConfig_ignoreChildren",
			overrideClassFields		: "P2GUI_obj_exportConfig_classFields"
		}
	},
	
	/* exporter */
	exporter		: {
		/* overrides */
		overrides		: {
			exportJSON				: "P2GUI_exp_overrides_exportJSON",
			exportPNG				: "P2GUI_exp_overrides_exportPNG",
		},
	},
}

/* document configuration defaults */
P2GUI.document.configurationDefaults = {
	exportJsonName			: "",
	autoClassType			: P2GUI.value.pixijs,
	classFieldsType			: P2GUI.value.none,
	humanReadable			: P2GUI.value.NO,
	exportJsonPath			: "",
	exportImagePath			: "",
	autoClassDescriptor		: "",
	classFieldsDescriptor	: "",
};

/* element information defaults */
P2GUI.element.informationDefaults = {
	name					: P2GUI.value.layerName,
	id						: "",
	className				: "",
	misc					: "",
};

/* element layout defaults */
P2GUI.element.layoutDefaults = {
	horizontalPosition		: P2GUI.value.absolute,
	verticalPosition		: P2GUI.value.absolute,
	horizontalSnapTo		: P2GUI.value.left,
	verticalSnapTo			: P2GUI.value.top,
	horizontalRelative		: P2GUI.value.relativeH,
	verticalRelative		: P2GUI.value.relativeV,
	maintainRelativeScale	: P2GUI.value.YES,
};

/* element export options defaults */
P2GUI.element.exportOptionsDefaults = {
	exportPNG				: P2GUI.value.YES,
	exportJSON				: P2GUI.value.YES,
	ignoreChildren			: P2GUI.value.NO,
	overrideClassFields		: P2GUI.value.none,
	quickExportPNG			: P2GUI.value.none,
};

/* exporter overrides defaults */
P2GUI.exporter.overridesDefaults = {
	exportJSON				: P2GUI.value.YES,
	exportPNG				: P2GUI.value.YES,
}

//------------///////////////////////////////////------------//
//------------///////////// GLOBALS /////////////------------//
//------------///////////////////////////////////------------//
var g_doc = null;
var g_layer = null;
var g_isExporting = false;

//------------///////////////////////////////////------------//
//------------//// TRACK LAYER AND DOCUMENT /////------------//
//------------///////////////////////////////////------------//

function saveDocumentAndLayer()
{
	if (hasActiveDocument())
	{
		g_doc = app.activeDocument;
		g_layer = app.activeDocument.activeLayer;
	}
	else
	{
		g_doc = null;
		g_layer = null;
	}
}

function updateSelectedDocument()
{
	var newDocument = null;
	if (hasActiveDocument())
	{
		newDocument = app.activeDocument;
	}
	
	if (newDocument != g_doc)
	{
		g_doc = newDocument;
		updateSelectedLayer();
		return true;
	}
	
	return false;
}

function updateSelectedLayer()
{
	var newLayer = null;
	if (hasActiveDocument())
	{
		newLayer = app.activeDocument.activeLayer;
	}
	
	if (newLayer != g_layer)
	{
		g_layer = newLayer;
		return true;
	}
	
	return false;
}

//------------///////////////////////////////////------------//
//------------////// XMP LIBRARY UTILITIES //////------------//
//------------///////////////////////////////////------------//

/**
The function loads the XMP Script Library.
@returns True if the XMP Script Library was loaded successfully.
@type Boolean
*/
function loadXMPLibrary(){
	if ( !ExternalObject.AdobeXMPScript ){
		try{
			ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
		}catch (e){
			alert(arguments.callee.name + ": " + e.toString());
			return false;
		}
	}
	return true;
}


/**
The function unloads the XMP Script Library.
*/
function unloadXMPLibrary(){
	if( ExternalObject.AdobeXMPScript ) {
		try{
			ExternalObject.AdobeXMPScript.unload();
			ExternalObject.AdobeXMPScript = undefined;
		}catch (e){
			alert(arguments.callee.name + ": " + e.toString());
		}
	}
}

//------------///////////////////////////////////------------//
//------------/////// METADATA UTILITIES ////////------------//
//------------///////////////////////////////////------------//
function bridgeObject(obj)
{
	if (obj)
	{
		return JSON.stringify(obj);
	}
	
	return "{}";
}

function receiveObject(obj)
{
	if (obj)
	{
		return JSON.parse(obj);
	}
	
	return {};
}

function getLayerProperties()
{
	if (hasActiveDocument())
	{
		var layer = app.activeDocument.activeLayer;
		if (!layer.isBackgroundLayer)
		{
			var newArgs = [layer];
			newArgs.push.apply(newArgs, arguments);
			return getObjectProperties.apply(this, newArgs);
		}
		else
		{
			alert("P2GUI Cannot work on background layers.")
		}
	}
	
	return null;
}

function setLayerProperties()
{
	if (hasActiveDocument())
	{
		var layer = app.activeDocument.activeLayer;
		if (!layer.isBackgroundLayer)
		{
			var newArgs = [layer];
			newArgs.push.apply(newArgs, arguments);
			return setObjectProperties.apply(this, newArgs);
		}
		else
		{
			alert("P2GUI Cannot work on background layers.")
		}
	}
	
	return false;
}

function getDocumentProperties()
{
	if (hasActiveDocument())
	{
		var newArgs = [app.activeDocument];
		newArgs.push.apply(newArgs, arguments);
		return getObjectProperties.apply(this, newArgs);
	}
	return null;
}

function setDocumentProperties()
{
	if (hasActiveDocument())
	{
		var newArgs = [app.activeDocument];
		newArgs.push.apply(newArgs, arguments);
		return setObjectProperties.apply(this, newArgs);
	}
	
	return false;
}

function getObjectProperties(obj)
{
	var ret = {};
	if(obj && arguments.length > 1 && loadXMPLibrary())
	{
		var argumentLength = arguments.length;
		for (var i = 1; i < argumentLength; ++i)
		{
			var property = arguments[i];
			var value = getObjectMetadata(obj, property);
			if (value)
			{
				ret[property] = value;
			}
		}
		
		unloadXMPLibrary();
	}
	
	return ret;
}

function setObjectProperties(obj)
{
	if(obj && arguments.length > 1 && loadXMPLibrary())
	{
		var argumentLength = arguments.length;
		for (var i = 1; i < argumentLength; i += 2)
		{
			var property = arguments[i];
			var propertyValue = arguments[i + 1];
			
			var success = setObjectMetadata(obj, property, propertyValue);
			if (!success)
			{
				unloadXMPLibrary();
				return false;
			}
		}
		
		unloadXMPLibrary();
		return true;
	}
	
	return false;
}

function getObjectMetadata(obj, propertyName)
{
    var ret = null;
    
    if(obj && propertyName)
    {
        var xmp;
        try
        { 
			xmp = new XMPMeta(obj.xmpMetadata.rawData);
        }
        catch(e)
        {
        	if (obj == app.activeDocument)
        	{
	        	alert(arguments.callee.name + "::XMPMeta: " + e.toString());
	            return ret;
        	}
        	else
        	{
        		xmp = new XMPMeta();
        	}
        }
        
        // try to get the property value //
        var propertyValue;
        try
        {
            propertyValue = xmp.getProperty(P2GUI.namespace, propertyName);
            if (propertyValue)
            {
            	propertyValue = propertyValue.toString();
            }
        }
        catch(e)
        {
        	//alert(arguments.callee.name + "::getProperty: " + e.toString());
            return ret;
        }
        
        ret = propertyValue;
    }
	return ret;
}

function setObjectMetadata(obj, propertyName, propertyValue)
{
    if(obj && propertyName && (typeof propertyValue == 'string' || propertyValue instanceof String))
    {
        var xmp;
        try
        {
			xmp = new XMPMeta(obj.xmpMetadata.rawData);
        }
        catch(e)
        {
        	if (obj == app.activeDocument)
        	{
	        	alert(arguments.callee.name + "::XMPMeta: " + e.toString());
	            return false;
        	}
        	else
        	{
        		xmp = new XMPMeta();
        	}
        }
        
        try
        {
        	XMPMeta.registerNamespace(P2GUI.namespace, P2GUI.namespacePrefix);
        }
        catch (e)
        {
        	alert(arguments.callee.name + "::registerNamespace: " + e.toString());
        }
        
        // try to set the property value //
        try
        {
        	xmp.setProperty(P2GUI.namespace, propertyName, propertyValue);
        	obj.xmpMetadata.rawData = xmp.serialize();
        }
        catch(e)
        {
        	//alert(arguments.callee.name + "::setProperty: " + e.toString());
            return false;
        }
        
        return true;
    }
    
	return false;
}


//------------///////////////////////////////////------------//
//------------////// GUI UTILITY FUNCTIONS //////------------//
//------------///////////////////////////////////------------//

function showAlert(string)
{
	alert(string);
}

function hasActiveDocument()
{
	return (!!app.documents.length) && (!!app.activeDocument);
}

function isDocumentSaved()
{
	var docPath = null;
	try
	{
		docPath = app.activeDocument.fullName.path;
	}
	catch (e)
	{
		return false;
	}
	
	return (!!docPath);
}

function isP2GUIEnabled()
{
	saveDocumentAndLayer();
	if (hasActiveDocument())
	{
		var metadata = getObjectProperties(app.activeDocument, P2GUI.enabled);
		var ret = (metadata[P2GUI.enabled] == P2GUI.value.YES);
		
		return ret;
	}
	return false;
}

function enableP2GUI()
{
	if (!hasActiveDocument())
	{
		alert("No active document detected, please open a document to work with!");
		return false;
	}
	else if (!isDocumentSaved())
	{
		alert("P2GUI can only work on saved documents, save your document and try again");
		return false;
	}
	
	var result = setObjectProperties(app.activeDocument, P2GUI.enabled, P2GUI.value.YES);
	if (result)
	{
		saveDocumentAndLayer();
	}
	
	return  result;
}

function getLayerName()
{
	if (hasActiveDocument() && !app.activeDocument.activeLayer.isBackgroundLayer)
	{
		return app.activeDocument.activeLayer.name;
	}
	
	return "";
}

function setLayerName(name)
{
	if (hasActiveDocument() && !app.activeDocument.activeLayer.isBackgroundLayer)
	{
		app.activeDocument.activeLayer.name = name;
	}
}


//------------///////////////////////////////////------------//
//------------///// LAYER UTILITY FUNCTIONS /////------------//
//------------///////////////////////////////////------------//

function getLayerRelativeHorizontal()
{
	return getLayerRelativePosition().x;
}

function getLayerRelativeVertical()
{
	return getLayerRelativePosition().y;
}

function getLayerRelativePosition()
{
	var ret = getLayerCenter();
	
	if (hasActiveDocument())
	{
		var doc = app.activeDocument;
		ret.x = ret.x / doc.width.as('px');
		ret.y = ret.y / doc.height.as('px');
	}
	
	return ret;
}

function setLayerRelativeX(x)
{
	if (hasActiveDocument())
	{
		setLayerPosition(g_doc.width.as('px') * x, null);
	}
}

function setLayerRelativeY(y)
{
	if (hasActiveDocument())
	{
		setLayerPosition(null, g_doc.height.as('px') * y);
	}
}

function setLayerRelativePosition(x, y)
{
	if (hasActiveDocument())
	{
		setLayerPosition(g_doc.width.as('px') * x, g_doc.height.as('px') * y);
	}
}

function setLayerPosition(x, y)
{
	if (hasActiveDocument())
	{
		var saveUnit = preferences.rulerUnits;
		var layerCenter = getLayerCenter();
		var newX = (x != null) ? x - layerCenter.x : 0;
		var newY = (y != null) ? y - layerCenter.y : 0;
		preferences.rulerUnits = Units.PIXELS;
		g_doc.activeLayer.translate(newX, newY);
		preferences.rulerUnits = saveUnit;
	}
}

function getLayerRect()
{
	var ret = {
			x		: 0,
			y		: 0,
			width	: 0,
			height	: 0
	};
	
	if (hasActiveDocument())
	{
		var layer = app.activeDocument.activeLayer;
		if (!layer.isBackgroundLayer)
		{
			var bounds = layer.bounds;
			ret.x = bounds[0].as('px');
			ret.y = bounds[1].as('px');
			ret.width = (bounds[2].as('px') - bounds[0].as('px'));
			ret.height = (bounds[3].as('px') - bounds[1].as('px'));
		}
	}
	
	return ret;
}

function getLayerCenter()
{
	var ret = {
			x	: 0,
			y	: 0
	};
	
	if (hasActiveDocument())
	{
		var doc = app.activeDocument;
		var rect = getLayerRect();
		ret.x = (rect.x + (rect.width * 0.5));
		ret.y = (rect.y + (rect.height * 0.5));
	}
	
	return ret;
}


//------------///////////////////////////////////------------//
//------------/// EXPORTER UTILITY FUNCTIONS ////------------//
//------------///////////////////////////////////------------//

function isExporting()
{
	return g_isExporting;
}

function setIsExporting(flag)
{
	g_isExporting = flag
}

function exportFolderPNG()
{
	var exportFolder = null;
	if (hasActiveDocument())
	{
		exportFolder = getObjectMetadata(app.activeDocument, P2GUI.document.configuration.exportImagePath);
		if (!exportFolder || exportFolder == P2GUI.value.none || exportFolder.length == 0)
		{
			exportFolder = "P2GUI/PNG";
		}
		exportFolder = app.activeDocument.fullName.path + "/" + exportFolder + "/";
	}
	
	return exportFolder;
}

function exportFolderJSON()
{
	var exportFolder = null;
	if (hasActiveDocument())
	{
		exportFolder = getObjectMetadata(app.activeDocument, P2GUI.document.configuration.exportJsonPath);
		if (!exportFolder || exportFolder == P2GUI.value.none || exportFolder.length == 0)
		{
			exportFolder = "P2GUI/JSON";
		}
		exportFolder = app.activeDocument.fullName.path + "/" + exportFolder + "/";
	}
	return exportFolder;
}

function exportLayoutName()
{
	var layoutName = null;
	
	if (hasActiveDocument())
	{
		layoutName = getObjectMetadata(app.activeDocument, P2GUI.document.configuration.exportJsonName);
		if (!layoutName || layoutName == P2GUI.value.none || layoutName.length == 0)
		{
			layoutName = app.activeDocument.name.match(/([^\.]+)/)[1];;
		}
	}
	
	return layoutName;
}

function exportCurrentLayerToPNG()
{
	if (hasActiveDocument())
	{
		var layer = app.activeDocument.activeLayer;
		if (!layer.isBackgroundLayer)
		{	
			loadXMPLibrary();
			var exportFolder = exportFolderPNG();
			var exportName = getObjectMetadata(layer, P2GUI.element.information.name);
			unloadXMPLibrary();
			
			if (exportName)
			{
				exportLayerToFile(layer, exportName, exportFolder);
			}
			else
			{
				alert("Layer Metadata ERROR: Cannot export layer to file.")
			}
		}
	}
}


function exportCurrentDocumentLayout()
{
	if (hasActiveDocument())
	{
		loadXMPLibrary();
		var folderPNG = exportFolderPNG();
		var folderJSON = exportFolderJSON();
		var exportName = exportLayoutName();
		unloadXMPLibrary();
		
		try
		{
			exportLayout(app.activeDocument, exportName, folderJSON, folderPNG, "1.0.0");
		}
		catch (e)
		{
			alert("Exception: " + e);
		}
	}
}




