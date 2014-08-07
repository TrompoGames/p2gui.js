//------------///////////////////////////////////------------//
//------------///////// GLOBAL VARIABLES ////////------------//
//------------///////////////////////////////////------------//
var g_P2GUINamespace = "http://p2gui.trompogames.com/1.0.0";
var g_P2GUINamespacePrefix = "p2gui:";
var g_P2GUIEnabled = "P2GUIEnabled";
var g_P2GUIYES = "YES";
var g_P2GUINO = " NO";


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

function getObjectMetadata(obj, propertyName)
{
    var ret = null;
    
    if(obj && loadXMPLibrary())
    {
        var xmp;
        try
        { 
			xmp = new XMPMeta(obj.xmpMetadata.rawData);
        }
        catch(e)
        {
        	$.writeln(arguments.callee.name + ": " + e.toString());
            unloadXMPLibrary();
            return ret;
        }
        
        // try to get the property value //
        var propertyValue;
        try
        {
            propertyValue = xmp.getProperty(g_P2GUINamespace, propertyName).toString();
        }
        catch(e)
        {
        	$.writeln(arguments.callee.name + ": " + e.toString());
            unloadXMPLibrary();
            return ret;
        }
        
        ret = propertyValue;
    }
	return ret;
}

function setObjectMetadata(obj, propertyName, propertyValue)
{
    if(obj && loadXMPLibrary())
    {
        var xmp;
        try
        { 
			xmp = new XMPMeta(obj.xmpMetadata.rawData);
        }
        catch(e)
        {
        	$.writeln(arguments.callee.name + ": " + e.toString());
            unloadXMPLibrary();
            return false;
        }
        
        try
        {
        	XMPMeta.registerNamespace(g_P2GUINamespace, g_P2GUINamespacePrefix);
        }
        catch (e)
        {
        	$.writeln(arguments.callee.name + ": " + e.toString());
        }
        
        // try to set the property value //
        try
        {
        	xmp.setProperty(g_P2GUINamespace, propertyName, propertyValue);
        	obj.xmpMetadata.rawData = xmp.serialize();
        }
        catch(e)
        {
        	$.writeln(arguments.callee.name + ": " + e.toString());
            unloadXMPLibrary();
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
		var metadata = getObjectMetadata(app.activeDocument, g_P2GUIEnabled);
		return (metadata == g_P2GUIYES);
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
	
	var result = setObjectMetadata(app.activeDocument, g_P2GUIEnabled, g_P2GUIYES);
	return  result;
}

function sayHello()
{
	alert("Hello Dario!");
	return "well this works!";
}