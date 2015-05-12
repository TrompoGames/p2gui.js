/**
 * Created by dario on 2014-09-08.
 */

(function (global)
{
    "use strict";

    var TAG = "P2GUI.Importer: ";

    /**
     * @namespace P2GUI
     * @type { Object }
     */
    global.P2GUI = global.P2GUI || {};

    /**
     * Class used to import layout exported from photoshop using the P2GUI panel. Requires pixi.js
     * @class Importer
     */
    var P2GImporter = {};

    /**
     * Method used to import a layout from a file, add the resulting elements to a container and execute a callback
     *
     * @method layoutFromFile
     * @param filePath { String }: A string containing the path to a json file containing the layout to import.
     * @param classContainer { Object }: Global object where classes described in the layout should be looked up. Optional, can be null.
     * @param callbacks { ImportCallbacks }: P2GImportCallbacks object configured for this layout.
     * @param layoutClass { Object }: The class used to instantiate the layout. Optional, if omitted P2GUI.Layout will be used.
     */
    P2GImporter.layoutFromFile = function(filePath, classContainer, callbacks, layoutClass)
    {
        var loader = new PIXI.JsonLoader(filePath);
        loader.on('loaded', function(evt) {
            P2GImporter.layoutFromDescriptor(evt.content.content.json, classContainer, callbacks, layoutClass);
        });
        loader.load();
    };

    /**
     * Method used to import a layout from a JSON string describing a layout, add the resulting elements to a container and execute a callback
     *
     * @method layoutFromString
     * @param jsonString { String }: A JSON string describing the layout to import.
     * @param classContainer { Object }: Global object where classes described in the layout should be looked up. Optional, can be null, defaults to the global object used to generate the class.
     * @param callbacks { ImportCallbacks }: P2GImportCallbacks object configured for this layout.
     * @param layoutClass { Object }: The class used to instantiate the layout. Optional, if omitted P2GUI.Layout will be used.
     */
    P2GImporter.layoutFromString = function(jsonString, classContainer, callbacks, layoutClass)
    {
        var descriptor = global.JSON.parse(jsonString);
        if (descriptor)
        {
            P2GImporter.layoutFromDescriptor(descriptor, classContainer, callbacks, layoutClass);
        }
        else
        {
            global.P2GUI.Log(TAG + "Cannot parse JSON string " + jsonString);
            callbacks.onLayoutLoaded(null);
        }
    };

    /**
     * Method used to import a layout from a JSON object describing a layout, add the resulting elements to a container and execute a callback
     *
     * @method layoutFromString
     * @param descriptor { Object }: A JSON object describing the layout to import.
     * @param classContainer { Object }: Global object where classes described in the layout should be looked up. Optional, can be null.
     * @param callbacks { ImportCallbacks }: P2GImportCallbacks object configured for this layout.
     * @param layoutClass { Object }: The class used to instantiate the layout. Optional, if omitted P2GUI.Layout will be used.
     */
    P2GImporter.layoutFromDescriptor = function(descriptor, classContainer, callbacks, layoutClass)
    {
        /* default parameters */
        classContainer = classContainer || global;
        layoutClass = layoutClass || global.P2GUI.Layout;

        var layoutName = descriptor["export-name"];
        var exportedRect = descriptor["export-rect"];

        if (layoutName && exportedRect)
        {
            var layout = new layoutClass(layoutName, classContainer);

            /* save the original size of the exported layout */
            layout.exportRect.width = exportedRect.width;
            layout.exportRect.height = exportedRect.height;

            /* get the desired size for the imported layout */
            var layoutSize = callbacks.provideLayoutSize(layoutName);
            if (layoutSize.width <= 0) layoutSize.width = exportedRect.width;
            if (layoutSize.height <= 0) layoutSize.height = exportedRect.height;
            layout.importRect.width = layoutSize.width;
            layout.importRect.height = layoutSize.height;

            /* calculate the best scale to maintain the element's propertions */
            /* only compute the size if the layout size is different than the export size */
            if (exportedRect.width != layoutSize.width || exportedRect.height != exportedRect.height)
            {
                /* calculate the scale between the exported and imported sizes */
                layout.importScale.set(layoutSize.width / exportedRect.width, layoutSize.height / exportedRect.height);

                /* if the sides are not equal favour the smallest scale */
                layout.preferredScale = Math.min(layout.importScale.y, layout.importScale.x);

                ///* always favor the smaller dimension from the layout's import size */
                //if (layoutSize.width < layoutSize.height)
                //{
                //    layout.preferredScale = layout.importScale.x;
                //}
                //else if (layoutSize.height < layoutSize.width)
                //{
                //    layout.preferredScale = layout.importScale.y;
                //}
                ///* if the sides are equal, use the smaller side from the exported size */
                //else if (exportedRect.width < exportedRect.height)
                //{
                //    layout.preferredScale = layout.importScale.x;
                //}
                //else /* if everything else fails, just use the y axis scale */
                //{
                //    layout.preferredScale = layout.importScale.y;
                //}
            }
            else
            {
                layout.preferredScale = 1.0;
            }

            /* get layout element array */
            var elements = descriptor["layout"];

            /* try to load an atlas with the name of the layout */
            var atlasPath = callbacks.providePathForAsset(layoutName, layoutName + ".json");
            if (atlasPath)
            {
                P2GImporter.tryToLoadAtlas(atlasPath, function(atlasDidLoad, atlasLoader)
                {
                    if (atlasDidLoad)
                    {
                        layout.atlasLoaded = atlasPath;
                        layout.atlasLoader = atlasLoader;
                    }
                    else
                    {
                        layout.atlasLoaded = null;
                        layout.atlasLoader = null;
                    }

                    P2GImporter.createElementsInLayout(layout, elements, classContainer, callbacks);
                });
            }
            else
            {
                P2GImporter.createElementsInLayout(layout, elements, classContainer, callbacks);
            }
        }
        else
        {
            global.P2GUI.Log(TAG + "Layout name or rect are invalid.");
            global.P2GUI.Log(TAG + "Name: " + layoutName);
            global.P2GUI.Log(TAG + "Rect: " + exportedRect);
            callbacks.onLayoutLoaded(null);
        }
    };

    /**
     * This function tries to load a texture atlas but it continues silently whether or not the atlas is loaded successfully
     *
     * @method tryToLoadAtlas
     * @param atlasPath { String }: The path to the atlas that should be loaded.
     * @param completionHandler(loaded) { Function }: A function to call once the process is complete.
     * @param loaded { Boolean }: False if an error occurred, otherwise true.
     */
    P2GImporter.tryToLoadAtlas = function(atlasPath, completionHandler)
    {
        var atlasLoader = new PIXI.JsonLoader(atlasPath);

        /* hack to cheat PIXI's loading system */
        var loadError = false;
        atlasLoader.on('loaded', function(evt) {
            completionHandler(!loadError, atlasLoader);
        });

        var ajaxRequest = null;

        var errorFunction = function ()
        {
            loadError = true;
        };

        var onloadendFunction = function()
        {
            if (!loadError && ajaxRequest.responseText)
            {

                var charIndex = 0;
                var char = ajaxRequest.responseText.charAt(charIndex);
                while (char == ' ' || char == '\n')
                {
                    ++charIndex;
                    char = ajaxRequest.responseText.charAt(charIndex);
                }

                if (char != '{')
                {
                    global.P2GUI.Log("P2GImporter.tryToLoadAtlas ERROR: Received response but failed to parse JSON!");
                    loadError = true;
                    atlasLoader.onLoaded();
                }
                else
                {
                    atlasLoader.ajaxRequest = ajaxRequest;
                    atlasLoader.onJSONLoaded();
                }
            }
            else
            {
                atlasLoader.onLoaded();
            }
        };

        if(window.XDomainRequest && this.crossorigin)
        {
            ajaxRequest = new window.XDomainRequest();

            // XDomainRequest has a few quirks. Occasionally it will abort requests
            // A way to avoid this is to make sure ALL callbacks are set even if not used
            // More info here: http://stackoverflow.com/questions/15786966/xdomainrequest-aborts-post-on-ie-9
            ajaxRequest.timeout = 3000;

            ajaxRequest.onerror = errorFunction.bind(this);

            ajaxRequest.ontimeout = errorFunction.bind(this);

            ajaxRequest.onprogress = function() {};

            ajaxRequest.onload = onloadendFunction.bind(this);
        }
        else
        {
            if (window.XMLHttpRequest)
            {
                ajaxRequest = new window.XMLHttpRequest();
            }
            else
            {
                ajaxRequest = new window.ActiveXObject('Microsoft.XMLHTTP');
            }

            ajaxRequest.onerror = errorFunction.bind(this);
            ajaxRequest.onloadend = onloadendFunction.bind(this);
        }

        ajaxRequest.open('GET', atlasPath, true);
        if (ajaxRequest.overrideMimeType) ajaxRequest.overrideMimeType('application/json');
        ajaxRequest.send(null);
    };

    /**
     * Tries to find the default importer class for the specified class. Returns a function on success or null on failure.
     *
     * @method findImporterForClass
     * @param classPath { String }: A string containing the path to the class which we are trying to import.
     * @param classContainer { Object }: The object containing the class to import.
     * @returns { Function }: Importer function or null if the default importer can't be found.
     */
    P2GImporter.findImporterForClass = function(classPath, classContainer)
    {
        /* find the components */
        var pathComponents = classPath.split(".");
        var componentsCount = pathComponents.length;
        var leaf = classContainer;
        /* find the leaf (or class the element's class) */
        for (var i = 0; i < componentsCount; ++i)
        {
            leaf = leaf[pathComponents[i]];
            if (!leaf) /* if an object can't be found, return null */
            {
                return null;
            }
        }

        /* try to find the default "createP2GUIInstance" function */
        var importer = leaf["createP2GUIInstance"];
        if (typeof importer === "function")
        {
            return importer;
        }

        return null;
    };

    /**
     * Calculates the rect the element should fill based on the given properties and containerDescription
     *
     * @param elementDescription { Object }: An object containing the element's description, usually from a P2GUI export.
     * @param containerDescription { Object }: An object containing "exportRect", "importRect" and "preferredScale"
     * @returns { PIXI.Rectangle }: Calculated desired rect
     */
    P2GImporter.calculateDesiredRectForElement = function(elementDescription, containerDescription)
    {
        /* get the needed information */
        var rect = new global.PIXI.Rectangle(elementDescription["rect"].x, elementDescription["rect"].y, elementDescription["rect"].width, elementDescription["rect"].height) ;
        rect.x -= containerDescription.exportRect.x;
        rect.y -= containerDescription.exportRect.y;
        var scale = (elementDescription["maintainRelativeScale"] === true) ? containerDescription.preferredScale : 1.0;
        var hPositionType = elementDescription["horizontalPosition"];
        var vPositionType = elementDescription["verticalPosition"];

        /* make sure the scale gets as close as possible to pixel perfect */
        scale = Math.round(rect.width * scale) / rect.width;

        /* scaled rect */
        var desiredRect = new PIXI.Rectangle(rect.x, rect.y, rect.width * scale, rect.height * scale);

        /* find the rect's horizontal layout based in its position/layout type */
        switch (hPositionType)
        {
            case "P2GUI_absolute":
                /* reposition based on the given scale */
                desiredRect.x = rect.x * scale;
                break;

            case "P2GUI_relative":
                /* calculate the elements center's relative value using the exported rects */
                var relativeValueX = (rect.x + (rect.width * 0.5)) / containerDescription.exportRect.width;
                /* reposition based on the resulting relative value */
                desiredRect.x = (containerDescription.importRect.width * relativeValueX) - (desiredRect.width * 0.5);
                break;

            case "P2GUI_snap":
                /* position depending on the selected snap option */
            {
                var snapType = elementDescription["horizontalSnapTo"];
                if (snapType == "P2GUI_left")
                {
                    desiredRect.x = rect.x * scale;
                }
                else if (snapType == "P2GUI_right")
                {
                    desiredRect.x = (containerDescription.importRect.width - desiredRect.width) - ((containerDescription.exportRect.width - (rect.x + rect.width)) * scale);
                }
                else
                {
                    desiredRect.x = rect.x * scale;
                    desiredRect.width = containerDescription.importRect.width - desiredRect.x - ((containerDescription.exportRect.width - (rect.x + rect.width)) * scale);
                }
            }
                break;

            case "P2GUI_elastic":
                desiredRect.x = containerDescription.importRect.width * (rect.x / containerDescription.exportRect.width);
                desiredRect.width = (containerDescription.importRect.width * ((rect.x + rect.width) / containerDescription.exportRect.width)) - desiredRect.x;
                break;

            default:
                break;
        }

        /* repeat for the rect's vertical layout */
        switch (vPositionType)
        {
            case "P2GUI_absolute":
                /* reposition based on the given scale */
                desiredRect.y = rect.y * scale;
                break;

            case "P2GUI_relative":
                /* calculate the elements center's relative value using the exported rects */
                var relativeValueY = (rect.y + (rect.height * 0.5)) / containerDescription.exportRect.height;
                /* reposition based on the resulting relative value */
                desiredRect.y = (containerDescription.importRect.height * relativeValueY) - (desiredRect.height * 0.5);
                break;

            case "P2GUI_snap":
                /* position depending on the selected snap option */
            {
                var snapType = elementDescription["verticalSnapTo"];
                if (snapType == "P2GUI_top")
                {
                    desiredRect.y = rect.y * scale;
                }
                else if (snapType == "P2GUI_bottom")
                {
                    desiredRect.y = (containerDescription.importRect.height - desiredRect.height) - ((containerDescription.exportRect.height - (rect.y + rect.height)) * scale);
                }
                else
                {
                    desiredRect.y = rect.y * scale;
                    desiredRect.height = containerDescription.importRect.height - desiredRect.y - ((containerDescription.exportRect.height - (rect.y + rect.height)) * scale);
                }
            }
                break;

            case "P2GUI_elastic":
                desiredRect.y = containerDescription.importRect.height * (rect.y / containerDescription.exportRect.height);
                desiredRect.height = (containerDescription.importRect.height * ((rect.y + rect.height) / containerDescription.exportRect.height)) - desiredRect.y;
                break;

            default:
                break;
        }

        /* make sure the rect is aligned to pixels */
        desiredRect.x = Math.round(desiredRect.x);
        desiredRect.y = Math.round(desiredRect.y);
        desiredRect.width = Math.round(desiredRect.width);
        desiredRect.height = Math.round(desiredRect.height);

        return desiredRect;
    };

    /**
     * Creates a pink rectangle where the imported element from the missing class should be, this is used as an error message
     *
     * @method createMissingClassImporterElement
     * @param layout { P2GUI.Layout }: The layout where the element was supposed to be created.
     * @param elementDescription { Object }: An object containing the element's description, usually from a P2GUI export.
     * @param desiredRect { PIXI.Rectangle }: Rectangle describing the desired size and position of the element.
     * @param callbacks { P2GUI.ImportCallbacks }: P2GImportCallbacks object configured for this layout.
     * @returns { PIXI.Graphics }: The final element.
     */
    P2GImporter.createMissingClassImporterElement = function(layout, elementDescription, desiredRect, callbacks, onCreated)
    {
        onCreated(P2GImporter.createErrorRectangle(0xFF55FF, 0x00FFFF, desiredRect), elementDescription["name"], elementDescription["id"]);
    };

    /**
     * Creates a blue rectangle where the imported element with the missing asset should be, this is used as an error message
     *
     * @method createMissingAssetImporterElement
     * @param layout { P2GUI.Layout }: The layout where the element was supposed to be created.
     * @param elementDescription { Object }: An object containing the element's description, usually from a P2GUI export.
     * @param desiredRect { PIXI.Rectangle }: Rectangle describing the desired size and position of the element.
     * @param callbacks { P2GUI.ImportCallbacks }: P2GImportCallbacks object configured for this layout.
     * @returns { PIXI.Graphics }: The final element.
     */
    P2GImporter.createMissingAssetImporterElement = function(layout, elementDescription, desiredRect, callbacks, onCreated)
    {
        onCreated(P2GImporter.createErrorRectangle(0x0000FF, 0xAAAAFF, desiredRect), elementDescription["name"], elementDescription["id"]);
    };

    /**
     * Utility function to create graphical error rectangles to let the user know when the export process failed
     *
     * @method createErrorRectangle
     * @param fillColor
     * @param lineColor
     * @param desiredRect
     * @returns {PIXI.Graphics}
     */
    P2GImporter.createErrorRectangle = function(fillColor, lineColor, desiredRect)
    {
        var graphics = new PIXI.Graphics();
        graphics.beginFill(fillColor);
        graphics.lineStyle(2, lineColor);
        graphics.drawRect(desiredRect.x, desiredRect.y, desiredRect.width, desiredRect.height);
        return graphics;
    };

    /**
     * Starts the process to create all the elements contained in a layout.
     *
     * @method createElementsInLayout
     * @param layout
     * @param elements
     * @param classContainer
     * @param callbacks
     */
    P2GImporter.createElementsInLayout = function(layout, elements, classContainer, callbacks)
    {
        /* treat the layout as a group at this point */
        P2GImporter.createElementsInGroup(layout, layout, elements, classContainer, callbacks, function()
        {
            callbacks.onLayoutLoaded(layout);
        });
    };

    /**
     * Function to parse the misc parameters as JSON data. Leaves the field untouched if it's not a JSON string.
     *
     * @method parseMiscParameters
     * @param elementDescription { Object }: An layout object description.
     * @returns { Object }
     */
    P2GImporter.parseMiscParameters = function(elementDescription)
    {
        /* assume that the misc info is in JSON format and try to import it */
        try
        {
            if (typeof elementDescription["misc"] === 'string' || elementDescription["misc"] instanceof String)
            {
                elementDescription["misc"] = JSON.parse(elementDescription["misc"]);
            }
        }
        catch (e)
        {
            global.P2GUI.Log("P2GImporter WARNING: The misc field could not be imported as a JSON string.");
        }

        return elementDescription;
    };

    /**
     * Creates and places the specified elements within the specified group.
     *
     * @method createElementsInGroup
     * @param layout
     * @param group
     * @param elements
     * @param classContainer
     * @param callbacks
     * @param onFinished
     */
    P2GImporter.createElementsInGroup = function(layout, group, elements, classContainer, callbacks, onFinished)
    {
        /* save the layout's name */
        var layoutName = layout.name;
        /* initialize the counter variables */
        var elementCount = elements.length;
        var elementIndex = 0;
        /* only process the elements if there are any */
        if (elementCount > 0)
        {
            /* create the onCreated callback */
            var onElementCreated = function(element, elementName, elementID)
            {
                ++elementIndex;
                layout.addElement(element, elementName, elementID);
                group.addChild(element);
                callbacks.onElementCreated(layoutName, element, elementName, elementID);
                if (elementIndex < elementCount)
                {
                    /* import the element */
                    P2GImporter.importElementInGroup(layout, group, P2GImporter.parseMiscParameters(elements[elementIndex]), classContainer, callbacks, onElementCreated);
                }
                else
                {
                    onFinished();
                }
            };
            /* trigger the first element loading manually */
            P2GImporter.importElementInGroup(layout, group, P2GImporter.parseMiscParameters(elements[0]), classContainer, callbacks, onElementCreated);
        }
        else
        {
            onFinished();
        }
    };

    /**
     * Imports the specified element within the specified group.
     *
     * @method importElementInGroup
     * @param layout
     * @param group
     * @param elementDescription
     * @param classContainer
     * @param callbacks
     * @param onCreated
     */
    P2GImporter.importElementInGroup = function(layout, group, elementDescription, classContainer, callbacks, onCreated)
    {
        var className = elementDescription["class"];
        var importer = P2GImporter.findImporterForClass(className, classContainer);
        if (!importer)
        {
            importer = callbacks.provideImporterFunctionForClass(layout.name, className);
            if (!importer)
            {
                importer = P2GImporter.createMissingClassImporterElement;
            }
        }

        var desiredRect = P2GImporter.calculateDesiredRectForElement(elementDescription, group);
        importer(layout, elementDescription, desiredRect, callbacks, onCreated);
    };

    /**
     * @export P2GUI.Importer
     * @type { Importer }
     */
    global.P2GUI.Importer = P2GImporter;

}(this));
