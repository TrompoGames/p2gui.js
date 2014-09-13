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
     * @param classSource { Object }: Global object where classes described in the layout should be looked up. Optional, can be null.
     * @param callbacks { ImportCallbacks }: P2GImportCallbacks object configured for this layout.
     */
    P2GImporter.layoutFromFile = function(filePath, classSource, callbacks)
    {
        var request = new XMLHttpRequest();

        request.onreadystatechange = function()
        {
            if(request.readyState == request.DONE)
            {
                if (request.status == 200)
                {
                    P2GImporter.layoutFromString(request.responseText, classSource, callbacks);
                }
                else
                {
                    console.log(TAG + "Cannot load file " + filePath + " with status: " + request.status);
                    callbacks.onLayoutLoaded.call(callbacks.target, null);
                }
            }
        };

        request.open('GET', filePath);
        request.send();
    }

    /**
     * Method used to import a layout from a JSON string describing a layout, add the resulting elements to a container and execute a callback
     *
     * @method layoutFromString
     * @param jsonString { String }: A JSON string describing the layout to import.
     * @param classSource { Object }: Global object where classes described in the layout should be looked up. Optional, can be null, defaults to the global object used to generate the class.
     * @param callbacks { ImportCallbacks }: P2GImportCallbacks object configured for this layout.
     */
    P2GImporter.layoutFromString = function(jsonString, classSource, callbacks)
    {
        var descriptor = JSON.parse(jsonString);
        if (descriptor)
        {
            P2GImporter.layoutFromDescriptor(descriptor, classSource, callbacks);
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
     * @param classSource { Object }: Global object where classes described in the layout should be looked up. Optional, can be null.
     * @param callbacks { ImportCallbacks }: P2GImportCallbacks object configured for this layout.
     */
    P2GImporter.layoutFromDescriptor = function(descriptor, classSource, callbacks)
    {
        /* default parameters */
        classSource = classSource || global;

        var layoutName = descriptor["export-name"];
        var layoutRect = descriptor["export-rect"];

        var colors = [
            0xFF0000,
            0xFF3300,
            0xFF6600,
            0xFF9900,
            0xFFFF00,
            0xFFFF33
        ]

        if (layoutName && layoutRect)
        {
            var layout = new global.P2GUI.Layout(layoutName);
            layout.exportSize.set(layoutRect.width, layoutRect.height);

            layout.width = layoutRect.width;
            layout.height = layoutRect.height;

            var elements = descriptor["layout"];
            var elementsCount = elements.length;
            for (var i = elementsCount - 1; i >= 0; --i)
            {
                var element = elements[i];
                var elementRect = element["rect"];
                var graphics = new PIXI.Graphics();

                graphics.beginFill(colors[colors.length%i]);

                // set the line style to have a width of 5 and set the color to red
                graphics.lineStyle(5, 0xFF00FF);

                // draw a rectangle
                console.log("Rect x:" + elementRect.x + " y:" + elementRect.y + " width:" + elementRect.width + " height:" + elementRect.height);
                graphics.drawRect(elementRect.x, elementRect.y, elementRect.width, elementRect.height);

                layout.addElement(graphics, element["name"], element["ID"]);
            }

            callbacks.onLayoutLoaded.call(callbacks.target, layout);

        }
        else
        {
            console.log(TAG + "Layout name or rect are invalid.");
            callbacks.onLayoutLoaded.call(callbacks.target, null);
        }

    }

    /**
     * @export P2GUI.Importer
     * @type { Importer }
     */
    global.P2GUI.Importer = P2GImporter;

}(this));
