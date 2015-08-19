/**
 * Created by dario on 2015-08-14.
 */

(function (global)
{
    "use strict";

    /* this is a singleton */
    var __P2GLocalization_instance__ = null;

    /**
     * @namespace P2GUI
     * @type { Object }
     */
    global.P2GUI = global.P2GUI || {};

    /**
     * Class description
     *
     * @class Localization
     * @constructor
     */
    function P2GLocalization()
    {
        /* singleton */
        if (__P2GLocalization_instance__)
        {
            return __P2GLocalization_instance__;
        }
        else if (!(this instanceof P2GLocalization))
        {
            __P2GLocalization_instance__ = new P2GLocalization();
            return __P2GLocalization_instance__;
        }

        __P2GLocalization_instance__ = this;

        /* private variables */
        this.m_languageCode = "en"; /* defaults to english */

        this.m_localization = {};

        //this.m_localizedLabels = {
        //    Wormarium_mainMenu:{
        //        UI_TEXT_PLAY:{
        //            en:"PLAY-O",
        //            zh:"在播放"
        //        }
        //    }
        //};

        /* init */
    }

    /**
     * Sets the two letter language code (ISO 639-1) to be used to localize the game.
     *
     * @property languageCode
     * @type { String }
     * @readonly
     */
    Object.defineProperty(P2GLocalization.prototype, "languageCode", {
        get: function()
        {
            return this.m_languageCode;
        },

        set: function(value)
        {
            this.m_languageCode = value;
        }
    });

    /**
     * Loads the specified localization file and, if configured, overwrites existing values.
     * Calls the onFinished callback with no arguments when the file has been loaded.
     *
     * @param file { String }
     * @param [overwriteExisting|false] { Boolean }
     * @param [onFinished|null] { Function }
     */
    P2GLocalization.prototype.loadLocalizationFile = function(file, overwriteExisting, onFinished)
    {
        /* default values */
        overwriteExisting = overwriteExisting || false;
        onFinished = onFinished || null;

        /* load the file */
        var proxy = this;
        var loader = new global.PIXI.JsonLoader(file);
        loader.on('loaded', function(evt) {
            var loadedData = evt.content.content.json;
            /* combine the loaded data with the existing one */
            if (overwriteExisting)
            {
                proxy._copyProperties(proxy.m_localization, loadedData, false);
                proxy.m_localization = loadedData;
            }
            else
            {
                peoxy._copyProperties(loadedData, proxy.m_localization, false);
            }

            if (onFinished)
            {
                onFinished();
            }

        });
        loader.load();
    };

    /**
     * Copies all the properties from one object to another, overwriting existing values as configured.
     *
     * @param from
     * @param to
     * @param overwrite
     * @private
     */
    P2GLocalization.prototype._copyProperties = function(from, to, overwrite)
    {
        for (var key in from)
        {
            if (from.hasOwnProperty(key))
            {
                if (!to[key] || overwrite)
                {
                    to[key] = from[key];
                }
                else
                {
                    this._copyProperties(from[key], to[key], overwrite);
                }
            }
        }
    };

    /**
     * Adds a localized font name for the specified original font.
     *
     * @param originalFont { String }
     * @param localizedFont { String }
     * @param locale { String }
     */
    P2GLocalization.prototype.addFontNameForLocale = function(originalFont, localizedFont, locale)
    {
        var localizedFonts = this.m_localization[P2GLocalization.LOCALIZED_FONTS_KEY];
        if (!localizedFonts)
        {
            localizedFonts = {};
            this.m_localization[P2GLocalization.LOCALIZED_FONTS_KEY] = localizedFonts;
        }

        var font = localizedFonts[originalFont];
        if (!font)
        {
            font = {};
            localizedFonts[originalFont] = font;
        }

        font[locale] = localizedFont;
    };

    /**
     * Returns a localized version for the given font, if available, using the configured locale.
     *
     * @param originalFont
     * @returns { String }
     */
    P2GLocalization.prototype.localizedFont = function(originalFont)
    {
        return this.localizedFontForLocale(originalFont, this.m_languageCode);
    };

    /**
     * Returns a localized version for the given font, if available, using the given locale.
     *
     * @param originalFont
     * @param locale
     * @returns {*}
     */
    P2GLocalization.prototype.localizedFontForLocale = function(originalFont, locale)
    {
        var localizedObject = this.m_localization[P2GLocalization.LOCALIZED_FONTS_KEY];
        if (localizedObject)
        {
            localizedObject = localizedObject[originalFont];

            if (localizedObject)
            {
                localizedObject = localizedObject[locale];

                if (localizedObject)
                {
                    return localizedObject;
                }
            }
        }

        return originalFont;
    };

    /**
     * Adds a localized string to the given locale.
     *
     * @param stringID
     * @param localizedString
     * @param locale
     */
    P2GLocalization.prototype.addStringLocalization = function(stringID, localizedString, locale)
    {
        var localizedStrings = this.m_localization[P2GLocalization.LOCALIZED_STRINGS_KEY];
        if (!localizedStrings)
        {
            localizedStrings = {};
            this.m_localization[P2GLocalization.LOCALIZED_STRINGS_KEY] = localizedStrings;
        }

        var stringInfo = localizedStrings[stringID];
        if (!stringInfo)
        {
            stringInfo = {};
            localizedStrings[stringID] = stringInfo;
        }

        stringInfo[locale] = localizedString;
    };

    /**
     * Returns a localized string for the given string id using the configured locale.
     *
     * @param stringID
     */
    P2GLocalization.prototype.localizedString = function(stringID)
    {
        return this.localizedStringForLocale(stringID, this.m_languageCode);
    };

    /**
     * Returns a localized string for the given string id using the given locale.
     *
     * @param stringID
     * @param locale
     * @returns { String }
     */
    P2GLocalization.prototype.localizedStringForLocale = function(stringID, locale)
    {
        var localizedObject = this.m_localization[P2GLocalization.LOCALIZED_STRINGS_KEY];
        if (localizedObject)
        {
            localizedObject = localizedObject[stringID];

            if (localizedObject)
            {
                localizedObject = localizedObject[locale];

                if (localizedObject)
                {
                    return localizedObject;
                }
            }
        }

        return null;
    };

    /**
     * Returns the localized caption for the specified label in the layout using the default locale.
     *
     * @param layout
     * @param labelName
     * @param labelID
     * @returns { String }
     */
    P2GLocalization.prototype.localizedCaptionForLabel = function(layout, labelName, labelID)
    {
        return this.localizedCaptionForLabelInLocale(layout, labelName, labelID, this.m_languageCode);
    };

    /**
     * Returns the localized caption for the specified label in the layout using the specified locale.
     *
     * @param layout
     * @param labelName
     * @param labelID
     * @param locale
     * @returns { String }
     */
    P2GLocalization.prototype.localizedCaptionForLabelInLocale = function(layout, labelName, labelID, locale)
    {
        var localizedObject;
        /* get the localized labels from the localization object */
        localizedObject = this.m_localization[P2GLocalization.LOCALIZED_LABELS_KEY];

        if (localizedObject)
        {
            /* try to find the layout in the localized database */
            localizedObject = localizedObject[layout.name];

            if (localizedObject)
            {
                /* if the id is not empty, use it, otherwise use the label's name */
                if (labelID)
                {
                    localizedObject = localizedObject[labelID];
                }
                else
                {
                    localizedObject = localizedObject[labelName];
                }

                if (localizedObject)
                {
                    /* try to find the specified locale */
                    localizedObject = localizedObject[locale];
                    return localizedObject || null;
                }
            }
        }

        return null;
    };

    /**
     *
     * @type {string}
     * @static
     */
    P2GLocalization.LOCALIZED_FONTS_KEY = "fonts";

    /**
     *
     * @type {string}
     * @static
     */
    P2GLocalization.LOCALIZED_LABELS_KEY = "labels";

    /**
     *
     * @type {string}
     * @static
     */
    P2GLocalization.LOCALIZED_STRINGS_KEY = "strings";

    /**
     * @export P2GUI.Localization
     * @type { Localization }
     */
    global.P2GUI.Localization = P2GLocalization;

}(this));
 