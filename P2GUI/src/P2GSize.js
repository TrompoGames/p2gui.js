/**
 * Created by dario on 2014-09-13.
 */

(function (global) {
    "use strict"

    /**
     * @namespace P2GUI
     * @type { Object }
     */
    global.P2GUI = global.P2GUI || {};

    /**
     * Class description
     *
     * @class Size
     * @constructor
     * @param [width=0] { Number }: Number representing the width size.
     * @param [height=0] { Number }: Number representing the height size.
     */
    function P2GSize(width, height)
    {
        /* properties */
        /**
         * @property width
         * @type { Number }
         * @default 0
         */
        this.width = width || 0;

        /**
         * @property height
         * @type { Number }
         * @default 0
         */
        this.height = height || 0;


        /* init */
    }

    /**
     * Creates a clone of this size
     *
     * @method clone
     * @return { Size } a copy of the size
     */
    P2GSize.prototype.clone = function()
    {
        return new P2GSize(this.width, this.height);
    };

    /**
     * Sets the size to a new width and height.
     *
     * @method set
     * @param [width=0] { Number } Number representing the width size.
     * @param [height=0] { Number } Number representing the height size.
     */
    P2GSize.prototype.set = function(width, height)
    {
        this.width = width || 0;
        this.height = height || 0;
    };

    /**
     * @export P2GUI.Layout
     * @type { Layout }
     */
    global.P2GUI.Size = P2GSize;

}(this));
 