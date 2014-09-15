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
     * @constructor
     */
    function P2GLayout(name)
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
         * The original export size of the layout
         *
         * @private
         * @type { P2GUI.Size }
         */
        var m_exportSize = new global.P2GUI.Size();

        /**
         * Dimensions of the imported layout
         *
         * @private
         * @type {P2GUI.Size}
         */
        var m_importSize = new global.P2GUI.Size();

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
         * Original export size
         *
         * @property exportSize
         * @type { P2GUI.Size }
         * @readonly
         */
        this.__defineGetter__("exportSize", function(){ return m_exportSize; });

        /**
         * Dimensions of the imported layout
         *
         * @property importSize
         * @type { P2GUI.Size }
         * @readonly
         */
        this.__defineGetter__("importSize", function(){ return m_importSize; });

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
        this.elements[elementName] = elementContainer;
        this.addChild(element);
    }

    /**
     * @export P2GUI.Layout
     * @type { Layout }
     */
    global.P2GUI.Layout = P2GLayout;

}(this));
