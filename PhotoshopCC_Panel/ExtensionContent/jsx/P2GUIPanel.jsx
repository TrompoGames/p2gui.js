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
		}
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
	if (hasActiveDocument)
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
	if (hasActiveDocument)
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
        	alert(arguments.callee.name + "::getProperty: " + e.toString());
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
        	alert(arguments.callee.name + "::setProperty: " + e.toString());
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
	if (hasActiveDocument())
	{
		var metadata = getObjectProperties(app.activeDocument, P2GUI.enabled);
		return (metadata[P2GUI.enabled] == P2GUI.value.YES);
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
	return  result;
}

function getLayerName()
{
	if (hasActiveDocument() && !app.activeDocument.activeLayerisBackgroundLayer)
	{
		return app.activeDocument.activeLayer.name;
	}
	
	return "";
}

function setLayerName(name)
{
	if (hasActiveDocument() && !app.activeDocument.activeLayerisBackgroundLayer)
	{
		app.activeDocument.activeLayer.name = name;
	}
}

function sayHello()
{
	alert("Hello Dario!");
	return "well this works!";
}