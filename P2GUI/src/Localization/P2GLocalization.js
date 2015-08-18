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
        this.m_languageCode = "zh";//"en"; /* defaults to english */
        this.m_localizedLabels = {
            Wormarium_mainMenu:{
                UI_TEXT_PLAY:{
                    en:"PLAY-O",
                    zh:"大"
                }
            }
        };

        this.m_localizedStrings = {};

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
     * Returns the localized caption for the specified label in the layout using the default locale.
     *
     * @param layout
     * @param labelName
     * @param labelID
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
     * @returns {*}
     */
    P2GLocalization.prototype.localizedCaptionForLabelInLocale = function(layout, labelName, labelID, locale)
    {
        var localizedObject;
        /* try to find the layout in the localized database */
        localizedObject = this.m_localizedLabels[layout.name];

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

        return null;
    };

    /**
     * Method example
     *
     * @method methodName
     */
//    P2GLocalization.prototype.methodName = function()
//    {
//        /* code */
//    };

    /**
     * @export P2GUI.Localization
     * @type { Localization }
     */
    global.P2GUI.Localization = P2GLocalization;

}(this));
 