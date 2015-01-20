/**
 * Created by dario on 2014-09-12.
 */

(function (global)
{
    "use strict"

    /**
     * @namespace P2GUI
     * @type { Object }
     */
    global.P2GUI = global.P2GUI || {};

    /**
     * Class that holds a P2GUI layout and its elements
     *
     * @class Layout
     * @param name { String }: The name of the layout to create.
     * @param [classContainer = global] { Object }: The container object for the classes of the elements in this layout
     * @constructor
     */
    function P2GLayout(name, classContainer)
    {
        name = name || "unnamed layout";

        /* super init */
        PIXI.DisplayObjectContainer.call(this);

        /* private variables */
        /**
         * Container for layout elements
         *
         * @private
         * @type { Object }
         */
        var m_elements = {};

        /**
         * Layout name variable
         *
         * @private
         * @type { String }
         */
        var m_name = name;

        /**
         * Class container, global object is used if nothing passed
         *
         * @private
         * @type {Object}
         */
        var m_classContainer = classContainer || global;

        /**
         * The original export size of the layout
         *
         * @private
         * @type { P2GUI.Size }
         */
        var m_exportRect = new global.PIXI.Rectangle();

        /**
         * Dimensions of the imported layout
         *
         * @private
         * @type {P2GUI.Size}
         */
        var m_importRect = new global.PIXI.Rectangle();

        /**
         * The proportional scale with respect to the original size
         *
         * @private
         * @type { PIXI.Point }
         */
        var m_importScale = new global.PIXI.Point(1.0, 1.0);

        /* properties */
        /**
         * Layout elements container
         *
         * @property elements
         * @type { Object }
         * @readonly
         */
        this.__defineGetter__("elements", function(){ return m_elements; });

        /**
         * Layout name
         *
         * @property name
         * @type { String }
         * @readonly
         */
        this.__defineGetter__("name", function(){ return m_name; });

        /**
         * Class container
         *
         * @property classContainer
         * @type { Object }
         * @readonly
         */
        this.__defineGetter__("classContainer", function(){ return m_classContainer; });

        /**
         * Original export rect
         *
         * @property exportRect
         * @type { P2GUI.Size }
         * @readonly
         */
        this.__defineGetter__("exportRect", function(){ return m_exportRect; });

        /**
         * Dimensions of the imported layout
         *
         * @property importRect
         * @type { P2GUI.Size }
         * @readonly
         */
        this.__defineGetter__("importRect", function(){ return m_importRect; });

        /**
         * The scale of the imported layout relative to the originally exported size
         *
         * @property importScale
         * @type { PIXI.Point }
         * @readonly
         */
        this.__defineGetter__("importScale", function(){ return m_importScale; });

        /**
         * The calculated preferred scale after processing the layout and its options
         *
         * @property preferredScale
         * @type { Number }
         */
        this.preferredScale = 0;
    }

    /**
     * @inheritance
     * @type { DisplayObjectContainer }
     */
    P2GLayout.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    P2GLayout.prototype.constructor = P2GLayout;

    /**
     * Adds an element with the given name and ID to the elements container
     *
     * @method addElement
     * @param element { * }: Object containing the element to store.
     * @param elementName { String }: The name of the element to store.
     * @param elementID { String }: The ID of the element to store. Optional, defaults to empty string.
     */
    P2GLayout.prototype.addElement = function(element, elementName, elementID)
    {
        var elementContainer = new global.P2GUI.Element(element, elementName, elementID);
        if (!this.elements[elementName])
        {
            this.elements[elementName] = elementContainer;
        }
        else
        {
            if (this.elements[elementName] instanceof global.P2GUI.Element)
            {
                var array = new Array();
                array.push(this.elements[elementName]);
                this.elements[elementName] = array;
            }

            this.elements[elementName].push(elementContainer);
        }
    };

    /**
     * Default P2GUI instantiation method, this only parses the needed information and creates a new object
     *
     * @method createP2GUIInstance
     * @param layout { P2GUI.Layout }: The layout where the element was supposed to be created.
     * @param elementDescription { Object }: An object containing the element's description, usually from a P2GUI export.
     * @param desiredRect { PIXI.Rectangle }: Rectangle describing the desired size and position of the element.
     * @param callbacks { P2GUI.ImportCallbacks }   : P2GImportCallbacks object configured for this layout.
     * @param onCreated { Function }: Callback function that should be invoked when the object is created.
     * @static
     */
    P2GLayout.createP2GUIInstance = function(layout, elementDescription, desiredRect, callbacks, onCreated)
    {
        var localCallbacks = callbacks.copy();

        localCallbacks.provideLayoutSize = function()
        {
            return new global.P2GUI.Size(desiredRect.width, desiredRect.height);
        };

        localCallbacks.onLayoutLoaded = function(layout)
        {
            layout.position.set(desiredRect.x, desiredRect.y);
            onCreated(layout, elementDescription["name"], elementDescription["id"]);
        };

        global.P2GUI.Importer.layoutFromFile(elementDescription["id"], layout.classContainer, localCallbacks);
    };

    /**
     * @export P2GUI.Layout
     * @type { Layout }
     */
    global.P2GUI.Layout = P2GLayout;

}(this));
