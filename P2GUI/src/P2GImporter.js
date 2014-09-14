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
            P2GImporter.layoutFromDescriptor(evt.content.json, classContainer, callbacks);
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
            console.log(TAG + "Cannot load parse JSON string " + jsonString);
            callbacks.onLayoutLoaded.call(callbacks.target, null);
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
            var layoutSize = callbacks.provideLayoutSize.call(callbacks.target, layoutName);
            if (layoutSize.width <= 0) layoutSize.width = exportedRect.width;
            if (layoutSize.height <= 0) layoutSize.height = exportedRect.height;
            layout.width = layoutSize.width;
            layout.height = layoutSize.height;

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
            var atlasPath = callbacks.providePathForAsset.call(callbacks.target, layoutName, layoutName + ".json");
            console.log("Atlas path: " + atlasPath);
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
            callbacks.onLayoutLoaded.call(callbacks.target, null);
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
        var atlasLoader = new PIXI.AtlasLoader(atlasPath);

        /* hack to cheat PIXI's loading system */
        var loadError = false;
        atlasLoader.onComplete = function()
        {
            completionHandler(!loadError);
        }

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
                atlasLoader.onAtlasLoaded.call(atlasLoader);
            }
            else
            {
                atlasLoader.onComplete();
            }
        };

        ajaxRequest.open('HEAD', atlasPath, true);
        if (ajaxRequest.overrideMimeType) ajaxRequest.overrideMimeType('application/json');
        ajaxRequest.send(null);
    }

    /**
     * Tries to find the default importer class for the specified class. Returns a function on success of null on failure.
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

    P2GImporter.createElementsInLayout = function(layout, elements, classContainer, callbacks)
    {

        var elementsCount = elements.length;
        for (var i = 0; i < elementsCount; ++i)
        {
            var element = elements[i];
            var elementRect = element["rect"];
            var graphics = new PIXI.Graphics();

            graphics.beginFill(0xFF55FF);

            // set the line style to have a width of 5 and set the color to red
            graphics.lineStyle(2, 0x00FFFF);

            // draw a rectangle
            graphics.drawRect(elementRect.x * layout.preferredScale, elementRect.y * layout.preferredScale, elementRect.width * layout.preferredScale, elementRect.height * layout.preferredScale);

            layout.addElement(graphics, element["name"], element["ID"]);
        }

        callbacks.onLayoutLoaded.call(callbacks.target, layout);
    }

    /**
     * @export P2GUI.Importer
     * @type { Importer }
     */
    global.P2GUI.Importer = P2GImporter;

}(this));
