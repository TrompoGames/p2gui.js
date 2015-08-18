/**
 * Created by dario on 2014-09-13.
 */

(function (global) {
    "use strict";

    /**
     * @namespace P2GUI
     * @type { Object }
     */
    global.P2GUI = global.P2GUI || {};

    /**
     * Class description
     *
     * @class Element
     * @param element { * }: Object containing the element to store.
     * @param elementName { String }: The name of the element to store.
     * @param elementID { String }: The ID of the element to store. Optional, defaults to empty string.
     * @constructor
     */
    function P2GElement(element, elementName, elementID)
    {
        /* default values */
        elementID = elementID || "";

        /* private variables */
        var m_element = element;
        var m_elementName = elementName;
        var m_elementID = elementID;

        /* properties */
        /**
         * The layout element object
         *
         * @property element
         * @type { *:PIXI.DisplayObject }
         */
        this.__defineGetter__("element", function(){ return m_element; });

        /**
         * Name of the element
         *
         * @property name
         * @type { String }
         */
        this.__defineGetter__("name", function(){ return m_elementName; });

        /**
         * ID of the element
         *
         * @property ID
         * @type { String }
         */
        this.__defineGetter__("ID", function(){ return m_elementID; });

        /* init */
    }

    /**
     * @export P2GUI.Element
     * @type { Element }
     */
    global.P2GUI.Element = P2GElement;

}(this));
 