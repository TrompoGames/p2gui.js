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

    /* constructor */
    /**
     * Wrapper class for the callbacks needed to complete an export
     *
     * @class ImportCallbacks
     * @constructor
     * @param target { * }: the target from which the callbacks will be invoked.
     */
    function P2GImportCallbacks(target)
    {
        /* private variables */

        /* properties */
        this.target = target;

        /* init */

        /* default handlers */
        this.m_onLayoutLoadedDefault = function(layout)
        {

        };

        this.m_onElementCreatedDefault = function(layoutName, element, elementName, elementID)
        {

        };

        this.m_provideLayoutSizeDefault = function(layoutName)
        {
            return new global.P2GUI.Size(0, 0);
        };

        this.m_providePathForAssetDefault = function(layoutName, assetFile)
        {
            return assetFile;
        };

        this.m_provideCaptionForLabelDefault = function(layoutName, labelName, labelID)
        {
            return labelName;
        };

        this.m_provideImporterFunctionForClassDefault = function(layoutName, className)
        {
            return null;
        }

        /* initialize handlers with default functions */
        this.m_onLayoutLoaded = this.m_onLayoutLoadedDefault;
        this.m_onElementCreated = this.m_onElementCreatedDefault;
        this.m_provideLayoutSize = this.m_provideLayoutSizeDefault;
        this.m_providePathForAsset = this.m_providePathForAssetDefault;
        this.m_provideCaptionForLabel = this.m_provideCaptionForLabelDefault;
        this.m_provideImporterFunctionForClass = this.m_provideImporterFunctionForClassDefault;


    }

    /* inheritance */

    /* properties */

    /**
     * Called when a layout has finished loading.
     *
     * @type { Function }
     * @default empty function
     * @property onLayoutLoaded(layout, layoutName) { Function }
     *                          @param layout { Layout }: The resulting layout when the load process is complete or null if an error occurred.
     */
    Object.defineProperty(P2GImportCallbacks.prototype, 'onLayoutLoaded', {
        get: function()
        {
            return this.m_onLayoutLoaded;
        },

        set: function(value)
        {
            this.m_onLayoutLoaded = value || this.m_onLayoutLoadedDefault;
        }
    });

    /**
     * Called every time an element is created in the layout
     *
     * @type { Function }
     * @default empty function
     * @property onElementCreated(layoutName, element, elementName, elementID) { Function }
     *                            @param layoutName { String }: The name of the layout to which the element belongs.
     *                            @param element { DisplayObject }: The loaded element.
     *                            @param elementName { String }: Name of the loaded element.
     *                            @param elementID { String }: ID of the loaded element.
     */
    Object.defineProperty(P2GImportCallbacks.prototype, 'onElementCreated', {
        get: function()
        {
            return this.m_onElementCreated;
        },

        set: function(value)
        {
            this.m_onElementCreated = value || this.m_onElementCreatedDefault;
        }
    });

    /**
     * Before a layout can be created the import size must be defined to be able to calculate the scale and correct positions of its elements.
     *
     * @type { Function }
     * @default function that returns a zero size, which is interpreted as the same size as the layout's exported size
     * @property provideLayoutSize(layoutName) { Function }
     *                             @param layoutName { String }: The name of the layout that will be sized to the new size
     *                             @return { P2GUI.Size }: The layout size represented by a P2GUI.Size, if either width, height or both is zero that field is interpreted as the exported size of the layout.
     */
    Object.defineProperty(P2GImportCallbacks.prototype, 'provideLayoutSize', {
        get: function()
        {
            return this.m_provideLayoutSize;
        },

        set: function(value)
        {
            this.m_provideLayoutSize = value || this.m_provideLayoutSizeDefault;
        }
    });

    /**
     * When an asset needs to be loaded, this function gets called to allow users to return a path to the required asset
     *
     * @type { Function }
     * @default function that returns the file name as if the file was stored at the root of the working folder
     * @property providePathForAsset(layoutName, assetFile) { Function }
     *                                @param layoutName { String }: The name of the layout trying to load the asset.
     *                                @param assetFile { String }: The file name of the asset to load.
     *                                @return { String }: The path to the asset to load, including the file name.
     */
    Object.defineProperty(P2GImportCallbacks.prototype, 'providePathForAsset', {
        get: function()
        {
            return this.m_providePathForAsset;
        },

        set: function(value)
        {
            this.m_providePathForAsset = value || this.m_providePathForAssetDefault;
        }
    });

    /**
     * When a label is created this function is called to obtain the string that should be rendered on the label
     *
     * @type { Function }
     * @default function that returns the label's name as the text to be rendered
     * @property provideCaptionForLabel(layoutName, labelName, labelID) { Function }
     *                                  @param layoutName { String }: The name of the layout to which the label belongs.
     *                                  @param labelName { String }: The name of the label on which the text will be rendered.
     *                                  @param labelID { String }: The ID of the label on which the text will be rendered.
     *                                  @return { String }: The string that should be rendered on the label.
     */
    Object.defineProperty(P2GImportCallbacks.prototype, 'provideCaptionForLabel', {
        get: function()
        {
            return this.m_provideCaptionForLabel;
        },

        set: function(value)
        {
            this.m_provideCaptionForLabel = value || this.m_provideCaptionForLabelDefault;
        }
    });

    /**
     * Every element is imported using a class. Importer functions have the ability to create instances of such classes for use in P2GUI layouts.
     * The importer tries to automatically find the importer functions for each class, if it fails, it resorts to this callback to provide the importer function.
     * If this callback returns null the importer will simply draw a pink square in the element's place to make the user aware of the issue.
     *
     * @type { Function }
     * @default function that returns null
     * @property provideImporterFunctionForClass(layoutName, className) { Function }
     *                                @param layoutName { String }: The name of the layout trying to load the asset.
     *                                @param className { String }: The class name as configured in the export.
     *                                @return { Function }: An importer function to create an instance of the required class.
     */
    Object.defineProperty(P2GImportCallbacks.prototype, 'provideImporterFunctionForClass', {
        get: function()
        {
            return this.m_provideImporterFunctionForClass;
        },

        set: function(value)
        {
            this.m_provideImporterFunctionForClass = value || this.m_provideImporterFunctionForClassDefault;
        }
    });

    /**
     * @export P2GUI.ImportCallbacks
     * @type { ImportCallbacks }
     */
    global.P2GUI.ImportCallbacks = P2GImportCallbacks;

}(this));
