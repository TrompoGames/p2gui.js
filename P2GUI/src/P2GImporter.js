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
     */
    P2GImporter.layoutFromFile = function(filePath, classContainer, callbacks)
    {
        var loader = new PIXI.JsonLoader(filePath);
        loader.on('loaded', function(evt) {
            P2GImporter.layoutFromDescriptor(evt.content.content.json, classContainer, callbacks);
        });
        loader.load();
    }

    /**
     * Method used to import a layout from a JSON string describing a layout, add the resulting elements to a container and execute a callback
     *
     * @method layoutFromString
     * @param jsonString { String }: A JSON string describing the layout to import.
     * @param classContainer { Object }: Global object where classes described in the layout should be looked up. Optional, can be null, defaults to the global object used to generate the class.
     * @param callbacks { ImportCallbacks }: P2GImportCallbacks object configured for this layout.
     */
    P2GImporter.layoutFromString = function(jsonString, classContainer, callbacks)
    {
        var descriptor = JSON.parse(jsonString);
        if (descriptor)
        {
            P2GImporter.layoutFromDescriptor(descriptor, classContainer, callbacks);
        }
        else
        {
            console.log(TAG + "Cannot parse JSON string " + jsonString);
            callbacks.onLayoutLoaded(null);
        }
    }

    /**
     * Method used to import a layout from a JSON object describing a layout, add the resulting elements to a container and execute a callback
     *
     * @method layoutFromString
     * @param descriptor { Object }: A JSON object describing the layout to import.
     * @param classContainer { Object }: Global object where classes described in the layout should be looked up. Optional, can be null.
     * @param callbacks { ImportCallbacks }: P2GImportCallbacks object configured for this layout.
     */
    P2GImporter.layoutFromDescriptor = function(descriptor, classContainer, callbacks)
    {
        /* default parameters */
        classContainer = classContainer || global;

        var layoutName = descriptor["export-name"];
        var exportedRect = descriptor["export-rect"];

        if (layoutName && exportedRect)
        {
            var layout = new global.P2GUI.Layout(layoutName);

            /* save the original size of the exported layout */
            layout.exportSize.set(exportedRect.width, exportedRect.height);

            /* get the desired size for the imported layout */
            var layoutSize = callbacks.provideLayoutSize(layoutName);
            if (layoutSize.width <= 0) layoutSize.width = exportedRect.width;
            if (layoutSize.height <= 0) layoutSize.height = exportedRect.height;
            layout.importSize.set(layoutSize.width, layoutSize.height);

            /* calculate the best scale to maintain the element's propertions */
            /* only compute the size if the layout size is different than the export size */
            if (exportedRect.width != layoutSize.width || exportedRect.height != exportedRect.height)
            {
                /* calculate the scale between the exported and imported sizes */
                layout.importScale.set(layoutSize.width / exportedRect.width, layoutSize.height / exportedRect.height);
                /* always favor the smaller dimension from the laouts import size */
                if (layoutSize.width < layoutSize.height)
                {
                    layout.preferredScale = layout.importScale.x;
                }
                else if (layoutSize.height < layoutSize.width)
                {
                    layout.preferredScale = layout.importScale.y;
                }
                /* if the sides are equal, use the smaller side from the exported size */
                else if (exportedRect.width < exportedRect.height)
                {
                    layout.preferredScale = layout.importScale.x;
                }
                else /* if everything else fails, just use the y axis scale */
                {
                    layout.preferredScale = layout.importScale.y;
                }
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
                P2GImporter.tryToLoadAtlas(atlasPath, function()
                {
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
            console.log(TAG + "Layout name or rect are invalid.");
            callbacks.onLayoutLoaded(null);
        }
    }

    /**
     * This function tries to load a texture atlas but it continues silently whether or not the atlas is loaded successfully
     *
     * @method tryToLoadAtlas
     * @param atlasPath { String }: The path to the atlas that should be loaded.
     * @param completionHandler(loaded) { Function }: A function to call once the process is complete.
     *                          @param loaded { Boolean }: False if an error occurred, otherwise true.
     */
    P2GImporter.tryToLoadAtlas = function(atlasPath, completionHandler)
    {
        var atlasLoader = new PIXI.JsonLoader(atlasPath);

        /* hack to cheat PIXI's loading system */
        var loadError = false;
        atlasLoader.on('loaded', function(evt) {
            completionHandler(!loadError);
        });

        var ajaxRequest = new PIXI.AjaxRequest();
        ajaxRequest.onerror = function ()
        {
            loadError = true;
        };

        ajaxRequest.onloadend = function()
        {
            if (!loadError)
            {
                atlasLoader.ajaxRequest = ajaxRequest;
                atlasLoader.onJSONLoaded();
            }
            else
            {
                atlasLoader.onLoaded();
            }
        };

        ajaxRequest.open('GET', atlasPath, true);
        if (ajaxRequest.overrideMimeType) ajaxRequest.overrideMimeType('application/json');
        ajaxRequest.send(null);
    }

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
    }

    /**
     * Calculates the rect the element should fill based on the given properties and layout size
     *
     * @param elementDescription { Object }: An object containing the element's description, usually from a P2GUI export.
     * @param layout { P2GUI.Layout }: The layout in which the object will be placed
     * @returns { PIXI.Rectangle }: Calculated desired rect
     */
    P2GImporter.calculateDesiredRectForElement = function(elementDescription, layout)
    {
        /* get the needed information */
        var rect = elementDescription["rect"];
        var scale = (elementDescription["maintainRelativeScale"] === true) ? layout.preferredScale : 1.0;
        var hPositionType = elementDescription["horizontalPosition"];
        var vPositionType = elementDescription["verticalPosition"];

        /* scaled rect */
        var desiredRect = new PIXI.Rectangle(rect.x, rect.y, rect.width * scale, rect.height * scale);

        /* find the rect's horizontal layout based in its position/layout type */
        switch (hPositionType)
        {
            case "P2GUI_absolute":
                /* reposition based on an anchor point at the center of the element */
                desiredRect.x = (rect.x + (rect.width * 0.5)) - (desiredRect.width * 0.5);
                break;

            case "P2GUI_relative":
                /* reposition based on the given relative value */
                desiredRect.x = (layout.importSize.width * elementDescription["horizontalRelative"]) - (desiredRect.width * 0.5);
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
                    desiredRect.x = (layout.importSize.width - desiredRect.width) - ((layout.exportSize.width - (rect.x + rect.width)) * scale);
                }
                else
                {
                    desiredRect.x = rect.x * scale;
                    desiredRect.width = layout.importSize.width - desiredRect.x - ((layout.exportSize.width - (rect.x + rect.width)) * scale);
                }
            }
                break;

            default:
                break;
        }

        /* repeat for the rect's vertical layout */
        switch (vPositionType)
        {
            case "P2GUI_absolute":
                /* reposition based on an anchor point at the center of the element */
                desiredRect.y = (rect.y + (rect.height * 0.5)) - (desiredRect.height * 0.5);
                break;

            case "P2GUI_relative":
                /* reposition based on the given relative value */
                desiredRect.y = (layout.importSize.height * elementDescription["verticalRelative"]) - (desiredRect.height * 0.5);
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
                    desiredRect.y = (layout.importSize.height - desiredRect.height) - ((layout.exportSize.height - (rect.y + rect.height)) * scale);
                }
                else
                {
                    desiredRect.y = rect.y * scale;
                    desiredRect.height = layout.importSize.height - desiredRect.y - ((layout.exportSize.height - (rect.y + rect.height)) * scale);
                }
            }
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
    }

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
    P2GImporter.createMissingClassImporterElement = function(layout, elementDescription, desiredRect, callbacks)
    {
        return P2GImporter.createErrorRectangle(0xFF55FF, 0x00FFFF, desiredRect);
    }

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
    P2GImporter.createMissingAssetImporterElement = function(layout, elementDescription, desiredRect, callbacks)
    {
        return P2GImporter.createErrorRectangle(0x0000FF, 0xAAAAFF, desiredRect);
    }

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
    }

    /* COMMENT THIS! */
    P2GImporter.createElementsInLayout = function(layout, elements, classContainer, callbacks)
    {
        console.log("createElementsInLayout");
        var elementsCount = elements.length;
        for (var i = 0; i < elementsCount; ++i)
        {
            var elementDescription = elements[i];
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

            var desiredRect = P2GImporter.calculateDesiredRectForElement(elementDescription, layout);
            var element = importer(layout, elementDescription, desiredRect, callbacks);
            layout.addElement(element, elementDescription["name"], elementDescription["ID"]);
        }

        callbacks.onLayoutLoaded(layout);
    }

    /**
     * @export P2GUI.Importer
     * @type { Importer }
     */
    global.P2GUI.Importer = P2GImporter;

}(this));
