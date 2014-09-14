//------------///////////////////////////////////------------//
//------------///////// P2GUI EXPORTER //////////------------//
//------------///////////////////////////////////------------//

var g_pixiAutoClassDescriptor = {
	RenderedShape	: "P2.RenderedShape",
	Group			: "PIXI.DisplayObjectContainer",
	TTFLabel		: "P2.TTFLabel",
	Sprite			: "PIXI.Sprite",
};

var g_cocosAutoClassDescriptor = {
	RenderedShape	: "CCSprite", /* not available */
	Group			: "CCNode",
	TTFLabel		: "CCLabelTTF",
	Sprite			: "CCSprite",
};

var g_defaultClassFieldsDescriptor = {
	defaultFields	: {
		properties : true,
	},
}

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

//----------------------------------------------------------------------------------------------------
function hasExportedName(name, exportedNames)
{
    for (var i = 0; i < exportedNames.length; ++i)
    {
        if (exportedNames[i] === name)
        {
            return true;
        }
    }
    return false;
}

//----------------------------------------------------------------------------------------------------
function autodetectClassType(layer, autoClassDescriptor)
{
    if (app.activeDocument.pathItems.length > 0)
    {
        return autoClassDescriptor['RenderedShape'];
    }
    else if (layer.typename == "LayerSet")
    {
        return autoClassDescriptor['Group'];
    }
    else if (layer.kind == LayerKind.TEXT)
    {
        return autoClassDescriptor['TTFLabel'];
    }
    
    return autoClassDescriptor['Sprite'];
}

//----------------------------------------------------------------------------------------------------
function exportLayerToFile(layer, name, exportPath) 
{
    var bounds = layer.bounds;
    var width = bounds[2] - bounds[0];
    var height = bounds[3] - bounds[1];
    var doc = app.activeDocument;
    var resolution = doc.resolution;
    
    // We'll merge the current layer down into a new empty layer that we create.
    // We do this because otherwise we can't copy some kinds of complicated layers.
    var layerCopy = layer.duplicate();
    var mergedLayer = doc.artLayers.add();
    
    var exportFolder = new Folder(exportPath);
    if (!exportFolder.exists)
    {
    	exportFolder.create();
        if (!exportFolder.exists)
        {
            alert("ERROR: Canont create PNG export folder!");
            return;
        }
    }
    
    mergedLayer.move(layerCopy, ElementPlacement.PLACEAFTER);
    
    mergedLayer = layerCopy.merge();
    mergedLayer.name = name;     
    if (mergedLayer)
    {
        // Copy layer to clipboard
        mergedLayer.copy();
        
        // Create a new file that we'll copy the layer into
        var exportedDoc = app.documents.add(width, height, resolution, doc.name + '_LAYER_TEMP', NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1);
        exportedDoc.paste();
        
        var exportedFilename = exportPath + name + '.png';
        var exportedFile = new File(exportedFilename);
        exportedDoc.saveAs(exportedFile, new PNGSaveOptions());
        
        // don’t save anything we did 
        exportedDoc.close(SaveOptions.DONOTSAVECHANGES);
        mergedLayer.remove();
    }
}

//----------------------------------------------------------------------------------------------------
function exportLayout(doc, name, jsonExportPath, pngExportPath, version)
{
    // hopefully this is not too slow //
    // find the classes group //
    var dump = [];
    var layers = doc.layers;
    
    var exportedNames = [];
    
    loadXMPLibrary();
    
    var autoClassType = getObjectMetadata(app.activeDocument, P2GUI.document.configuration.autoClassType);
    var classFieldsType = getObjectMetadata(app.activeDocument, P2GUI.document.configuration.classFieldsType);
    var globalMetaExportPNG = getObjectMetadata(app.activeDocument, P2GUI.exporter.overrides.exportPNG);
    var globalMetaExportJSON = getObjectMetadata(app.activeDocument, P2GUI.exporter.overrides.exportJSON);
    
    var autoClassDescriptor = null;
    if (autoClassType == P2GUI.value.pixijs)
    {
    	autoClassDescriptor = g_pixiAutoClassDescriptor;
    }
    else if (autoClassType == P2GUI.value.cocos2d)
    {
    	autoClassDescriptor = g_cocosAutoClassDescriptor;
    }
    else
    {
    	// open the file containing the custom descriptor //
    	var filePath = getObjectMetadata(app.activeDocument, P2GUI.document.configuration.autoClassDescriptor);
    	var fileHandle = new File (app.activeDocument.fullName.path + "/" + filePath);
    	if (fileHandle.exists)
    	{
	    	fileHandle.open("r");
	    	var fileString = fileHandle.read();
	    	fileHandle.close();
	    	
	    	autoClassDescriptor = JSON.parse(fileString, null);
    	}
    	else
    	{
    		autoClassDescriptor = g_pixiAutoClassDescriptor;
    	}
    }
    
    var classFieldsDescriptor = null;
    if (classFieldsType == P2GUI.value.none)
    {
    	classFieldsDescriptor = g_defaultClassFieldsDescriptor;
    }
    else
    {
    	// open the file containing the custom descriptor //
    	var filePath = getObjectMetadata(app.activeDocument, P2GUI.document.configuration.classFieldsDescriptor);
    	var fileHandle = new File (app.activeDocument.fullName.path + "/" + filePath);
    	if (fileHandle.exists)
    	{
	    	fileHandle.open("r");
	    	var fileString = fileHandle.read();
	    	fileHandle.close();
	    	classFieldsDescriptor = JSON.parse(fileString, null);
    	}
    	else
    	{
    		classFieldsDescriptor = g_defaultClassFieldsDescriptor;
    	}
    }
    
    var globalExportPNG = (globalMetaExportPNG != P2GUI.value.NO); // this works even if the value was not initialized //
    var globalExportJSON = (globalMetaExportJSON != P2GUI.value.NO);
    
    // iterate through the layerSets in the root and act accordingly //
    for (var i = 0; i < layers.length; ++i)
    {
        var layer = layers[i];
        // ignore invisible lawyer //
        if (layer.visible)
        {
        	var processedData = processNode(doc, layer, pngExportPath, exportedNames, autoClassDescriptor, classFieldsDescriptor, globalExportPNG, globalExportJSON);
        	if (processedData != null)
            {
        		dump[dump.length] = processedData;
            }
        }
    }
    
    unloadXMPLibrary();
    
    // reverse the array to be consistent with draw order in rendering libraries //
    dump.reverse();

    var finalExport = {};
    
    finalExport['exporter-version'] = version;
    finalExport['export-name'] = decodeURI(name);
    finalExport['export-rect'] = { x:0, y:0, width:doc.width.as('px'), height:doc.height.as('px') };
    finalExport['layout'] = dump;
    
    var exportFolder = new Folder(jsonExportPath);
    if (!exportFolder.exists)
    {
    	exportFolder.create();
        if (!exportFolder.exists)
        {
            alert("ERROR: Canont create JSON export folder!");
            return;
        }
    }
    
    var humanReadable = getObjectMetadata(app.activeDocument, P2GUI.document.configuration.humanReadable);
    var jsonFile = new File(jsonExportPath + name + ".json");
    jsonFile.open('w');
    if (humanReadable == P2GUI.value.YES)
    {
    	jsonFile.writeln(Utf8.encode(JSON.stringify(finalExport, null, '\t')));
    }
    else
    {
    	jsonFile.writeln(Utf8.encode(JSON.stringify(finalExport, null)));
    }
    jsonFile.close();
    
    alert ("Tadaaaaaa!\nThe export process is complete.");
}

//----------------------------------------------------------------------------------------------------
function processNode(doc, node, exportFolder, exportedNames, autoClassDescriptor, classFieldsDescriptor, globalExportPNG, globalExportJSON)
{
	var ret = {};
    
    // make the node the current layer //
    doc.activeLayer = node;
    
    // get the layer metadata //
    var metadata = {};
    
    for (var category in P2GUI.element)
    {
    	metadata[category] = {};
    	for (var key in P2GUI.element[category])
        {
        	metadata[category][key] = getObjectMetadata(node, P2GUI.element[category][key]);
        }
    }
    
    if (globalExportJSON == true && metadata['exportOptions']['exportJSON'] != P2GUI.value.NO)
    {
	    
	    ret['name'] = decodeURI(metadata['information']['name']);
	    ret['id'] = decodeURI(metadata['information']['id']);
	    ret['class'] = decodeURI(metadata['information']['className']);
	    ret['misc'] = decodeURI(metadata['information']['misc']);
	    ret['maintainRelativeScale'] = (metadata['layout']['maintainRelativeScale'] == P2GUI.value.YES);
	    
	    ret['horizontalPosition'] = metadata['layout']['horizontalPosition'];
	    ret['horizontalRelative'] = parseFloat(metadata['layout']['horizontalRelative']);
	    ret['horizontalSnapTo'] = metadata['layout']['horizontalSnapTo'];
	    
	    ret['verticalPosition'] = metadata['layout']['verticalPosition'];
	    ret['verticalRelative'] = parseFloat(metadata['layout']['verticalRelative']);
	    ret['verticalSnapTo'] = metadata['layout']['verticalSnapTo'];
	    
	    var layerRect = getLayerRect();
	    var position = getLayerCenter()
	    
	    ret['rect'] = layerRect;
	    ret['position'] = position;
	    /*==========================================*/
	    if (!ret['class'] || ret['class'] == P2GUI.value.none || ret['class'].length == 0)
	    {
	        ret['class'] = autodetectClassType(node, autoClassDescriptor);
	    }
	
	    if (hasExportedName(ret['name'], exportedNames))
	    {
	        alert("ERROR: Item names must be unique! Duplicated name: " + ret['name']);
	        throw ("ERROR: Item names must be unique! Duplicated name: " + ret['name']);
	    }
	    else
	    {
	    	exportedNames.push(ret['name']);
	    }
	    
	    var pathItems = doc.pathItems;
	    
	    if (pathItems.length > 0)
	    {
	        ret['vectormasks'] = [];
	        for (var i = 0; i < pathItems.length; ++i)
	        {
	            var path = pathItems[i];
	            
	            // It would appear that the path for the selected layer is of kind VECTORMASK.  If so, when does WORKPATH come into play?
	            if (path.kind == PathKind.VECTORMASK)
	            {
	                var vectorMaskIndex = ret['vectormasks'].length;
	                ret['vectormasks'][vectorMaskIndex] = [];
	                for (var subPathIndex = 0; subPathIndex < path.subPathItems.length; ++subPathIndex)
	                {
	                    var subPathDescription = {};
	                    var subPath = path.subPathItems[subPathIndex];
	                    var pointNumber = subPath.pathPoints.length;
	                    subPathDescription['points'] = [];
	                    for (var pointIndex = 0; pointIndex < pointNumber; ++pointIndex)
	                    {
	                        var point = subPath.pathPoints[pointIndex];
	                        var pointDescription = {};
	                        pointDescription['anchor'] = "{ " + point.anchor[0] + ", " + point.anchor[1] + " }";
	                        pointDescription['leftDirection'] = "{ " + point.leftDirection[0] + ", " + point.leftDirection[1] + " }";
	                        pointDescription['rightDirection'] = "{ " + point.rightDirection[0] + ", " + point.rightDirection[1] + " }";
	                        pointDescription['kind'] = (point.kind == PointKind.SMOOTHPOINT) ? "SMOOTHPOINT" : "CORNERPOINT";
	                        subPathDescription['points'][pointIndex] = pointDescription;
	                    }
	                    
	                    subPathDescription['closed'] = subPath.closed;
	                    switch (subPath.operation)
	                    {
	                    
	                    case ShapeOperation.SHAPEADD:
	                        subPathDescription['operation'] = "SHAPEADD";
	                        break;
	                        
	                    case ShapeOperation.SHAPEINTERSECT:
	                        subPathDescription['operation'] = "SHAPEINTERSECT";
	                        break;
	                        
	                    case ShapeOperation.SHAPESUBTRACT:
	                        subPathDescription['operation'] = "SHAPESUBTRACT";
	                        break;
	                        
	                    case ShapeOperation.SHAPEXOR:
	                        subPathDescription['operation'] = "SHAPEXOR";
	                        break;
	                        
	                    }
	                    ret['vectormasks'][vectorMaskIndex][subPathIndex] = subPathDescription;
	                }
	            }
	        }
	    }
	    
	    // if the layer has effects, remove them //
	    var ref = new ActionReference();
	    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
	    var layerDescription = executeActionGet(ref);
	    
	    var hadEffects = false;
	    if (layerDescription.hasKey(stringIDToTypeID('layerEffects')) && layerDescription.getBoolean(stringIDToTypeID('layerFXVisible')))
	    {
	        var fxDesc = layerDescription.getObjectValue(stringIDToTypeID('layerEffects'));
	        executeAction(charIDToTypeID("CpFX"), layerDescription, DialogModes.NO);
	        executeAction(charIDToTypeID("dlfx"), layerDescription, DialogModes.NO);
	        ret['noEffectsRect'] = getRectStringFromLayer(node);
	        executeAction(charIDToTypeID("PaFX"), layerDescription, DialogModes.NO);
	//~         ret['rect'] = getRectStringFromLayer(node);
	    }
	
	    if (metadata['exportOptions']['overrideClassFields'] != P2GUI.value.onlyBasic)
	    {
	    	var fieldsDescriptor = classFieldsDescriptor[ret['class']];
	    	if (!fieldsDescriptor)
	    	{
	    		fieldsDescriptor = classFieldsDescriptor['defaultFields'];
	    	}
	    	
	    	fieldsDescriptor = fieldsDescriptor['properties'];
	    	if (metadata['exportOptions']['overrideClassFields'] == P2GUI.value.exportAll || fieldsDescriptor === true)
	    	{
	    		fieldsDescriptor = null;
	    	}
	    	
	    	// kind of hungover while writing this code, fix it up... some day? //
	    	if (fieldsDescriptor !== false)
	    	{
			    ret['properties'] = {};
			    for (var i = 0; i < layerDescription.count; ++i)
			    {	
			        var propertyID = layerDescription.getKey (i);
			        var fieldObject = null;
			    	if (fieldsDescriptor != null)
			    	{
			    		fieldObject = fieldsDescriptor[propertyID];
			    	}
			    	
			    	if (fieldsDescriptor == null || fieldObject)
			    	{
			    		if (fieldObject === true || !fieldObject)
			    		{
			    			fieldObject = null;
			    		}
			    		
			    		var propertyValue = getKeyValueFromActionDecriptor (layerDescription, propertyID, fieldObject);
			    		ret['properties'][typeIDToStringID(propertyID)] = propertyValue;
			    	}
			    }
	    	}
	    }
	
	    if (node.typename == "LayerSet" && metadata['exportOptions']['ignoreChildren'] != P2GUI.value.YES)
	    {
	        var children = [];
	        var layers = node.layers;
	        for (var i = 0; i < layers.length; ++i)
	        {
	            var child = layers[i];
	            if (child.visible)
	            {
	            	var processedData = processNode(doc, child, exportFolder, exportedNames, autoClassDescriptor, classFieldsDescriptor, globalExportPNG, globalExportJSON);
	            	if (processedData != null)
	            	{
	            		children[children.length] = processedData;
	            	}
	            }
	        }
	        
	        if (children.length > 0)
	        {
	        	ret['children'] = children;
	        }
	    }
    }
    else
    {
    	ret = null;
    	if (node.typename == "LayerSet" && metadata['exportOptions']['ignoreChildren'] != P2GUI.value.YES)
	    {
	        var layers = node.layers;
	        for (var i = 0; i < layers.length; ++i)
	        {
	            var child = layers[i];
	            if (child.visible)
	            {
	            	processNode(doc, child, exportFolder, exportedNames, autoClassDescriptor, classFieldsDescriptor, globalExportPNG, false);
	            }
	        }
	    }
    }
    
    
    if (globalExportPNG == true && metadata['exportOptions']['exportPNG'] != P2GUI.value.NO)
    {
        var nameToExport = metadata['information']['id'];
        if (!nameToExport || nameToExport == P2GUI.value.none || nameToExport.length == 0)
        {
            nameToExport = metadata['information']['name'];
        }
        exportLayerToFile(node, nameToExport, exportFolder);
    }
	
	return ret;
}

//----------------------------------------------------------------------------------------------------
function getKeyValueFromActionDecriptor( object, key, fieldObject )
{
    var elementType = object.getType (key);
    var ret;
    switch (elementType)
    {
        case DescValueType.ALIASTYPE:
            ret = "ALIASTYPE";
            break;
            
        case DescValueType.BOOLEANTYPE:
            ret = object.getBoolean (key);
            break;
            
        case DescValueType.CLASSTYPE:
            ret = object.getClass (key);
            break;
            
        case DescValueType.DOUBLETYPE:
            ret = object.getDouble (key);
            break;
            
        case DescValueType.ENUMERATEDTYPE:
            ret = typeIDToStringID(object.getEnumerationValue (key));
            break;
            
        case DescValueType.INTEGERTYPE:
            ret = object.getInteger (key);
            break;
            
        case DescValueType.LISTTYPE:
            {
                ret = [];
                var elementList = object.getList (key);
                for (var i = 0; i < elementList.count; ++i)
                {
                    ret[i] = getKeyValueFromActionDecriptor(elementList, i, fieldObject);
                }
            }
            break;
            
        case DescValueType.OBJECTTYPE:
            {
	        	if (fieldObject === true)
	            {
	            	fieldObject = null;
	            }
	        	
                ret = {};
                var elementObject = object.getObjectValue (key);
                for (var i = 0; i < elementObject.count; ++i)
                {
                    var elementKey = elementObject.getKey (i);
                    var childFieldObject = null;
    		    	if (fieldObject != null)
    		    	{
    		    		fieldObject = fieldObject[typeIDToStringID(elementKey)];
    		    	}
    		    	
    		    	if (fieldObject == null || childFieldObject)
    		    	{
    		    		if (childFieldObject === true || !childFieldObject)
    		    		{
    		    			childFieldObject = null;
    		    		}
    		    		
    		    		ret[typeIDToStringID(elementKey)] = getKeyValueFromActionDecriptor(elementObject, elementKey, childFieldObject);
    		    	}
                }
            }
            break;
            
        case DescValueType.RAWTYPE:
            ret = "RAWTYPE";
            break;
            
        case DescValueType.REFERENCETYPE:
            ret = object.getReference (key);
            break;
            
        case DescValueType.STRINGTYPE:
            ret = object.getString (key);
            break;
            
        case DescValueType.UNITDOUBLE:
            ret = object.getUnitDoubleValue (key);
            break;
            
        default:
            ret = "TYPENOTFOUND";
            break;
    }
    return ret;
}


