/**
 * Created by dario on 2014-10-20.
 */

(function (global) {
    "use strict"

    /* this is a singleton */
    var __P2TTFFontManager_instance__ = null;

    /**
     * @namespace P2TTF
     * @type { Object }
     */
    global.P2TTF = global.P2TTF || {};

    /**
     * Class description
     *
     * @class FontManager
     * @constructor
     */
    function P2TTFFontManager() {
        /* singleton */
        if ( __P2TTFFontManager_instance__ ) {
            return __P2TTFFontManager_instance__;
        }
        __P2TTFFontManager_instance__ = this;

        /* default values */

        /* private variables */

        /* properties */

        /* init */
        this.m_fontCache = {};
    }

    /**
     * Get the font buffer to perform opperatins directly in it.
     * WARNING: Do not modify the font buffer unless you know what you are doing.
     *
     * @property fontCache
     * @type { Object }
     * @readonly
     */
    Object.defineProperty(P2TTFFontManager.prototype, 'fontCache', {
        get: function()
        {
            return this.m_fontCache;
        }
    });

    /**
     * Loads a font and caches it for later use.
     *
     * @method loadFont
     * @param fontFile { String }: The URL of the font file to load.
     * @param callback { Function }: A function to call when the font is loaded; or immediately if the font is already loaded. An 'error' and 'font'  parameters are passed to this function.
     */
    P2TTFFontManager.prototype.loadFont = function(fontFile, callback)
    {
        var loadedFont = this.m_fontCache[fontFile];
        if (loadedFont)
        {
            if (callback)
            {
                callback(null, loadedFont);
            }
        }
        else
        {
            var context = this;
            global.opentype.load(fontFile, function(error, font)
            {
                if (error)
                {
                    console.log(error);
                }
                else
                {
                    context.m_fontCache[fontFile] = font;
                }

                if (callback)
                {
                    callback(error, font);
                }
            });
        }
    }

    /**
     * Unloads a font from the cache if it was previously loaded.
     *
     * @method unloadFont
     * @param fontFile { String }: The URL from where the font was originally loaded.
     */
    P2TTFFontManager.prototype.unloadFont = function(fontFile)
    {
        var loadedFont = this.m_fontCache[fontFile];
        if (loadedFont)
        {
            loadedFont = null;
            delete this.m_fontCache[fontFile];
        }
    }

    /**
     * @export P2TTF.FontManager
     * @type { FontManager }
     * @singleton
     */
    global.P2TTF.FontManager = new P2TTFFontManager();

}(this));
 