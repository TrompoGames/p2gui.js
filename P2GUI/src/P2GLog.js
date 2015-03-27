/**
 * Created by dario on 15-03-27.
 */

(function (global)
{
    "use strict";

    /**
     * @namespace P2GUI
     * @type { Object }
     */
    global.P2GUI = global.P2GUI || {};

    /**
     * Simple polyfill for global.P2.Log
     */
    var P2GLog;

    if (global.console && global.console.log && typeof global.console.log === "function")
    {
        P2GLog = function()
        {
            if ((Array.prototype.slice.call(arguments)).length == 1 && typeof Array.prototype.slice.call(arguments)[0] == 'string')
            {
                console.log( (Array.prototype.slice.call(arguments)).toString() );
            }
            else
            {
                console.log( Array.prototype.slice.call(arguments) );
            }
        };
    }
    else
    {
        P2GLog = function() {};
    }

    /**
     * @export P2GUI.Log
     * @type { Log }
     */
    global.P2GUI.Log = P2GLog;

}(this));
 