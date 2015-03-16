/**
 * Created by dario on 2014-10-17.
 */

(function (global) {
    "use strict";

    /**
     * @namespace P2TTF
     * @type { Object }
     */
    global.P2TTF = global.P2TTF || {};

    /**
     * Renders a string of text as a sprite
     *
     * @class Label
     * @constructor
     * @param size { P2GUI.Size }: The size in which the text should be rendered.
     * @param text { String }: The text to render in the label.
     * @param fontFile { String }: Path to the font file to load and use.
     * @param fontSize { Number }: Font size to use while rendering the text.
     * @param color { Number }: The tint value to apply to the text.
     */
    function P2TTFLabel(size, text, fontFile, fontSize, color) {
        /* default values */
        color = isNaN(parseInt(color)) ? 0xffffff : parseInt(color);

        /* init */
        global.PIXI.DisplayObjectContainer.call(this);

        /* private variables */
        this.m_text = text;
        this.m_size = size;
        this.m_sizeScaled = new global.P2GUI.Size();
        this.m_textRect = new global.PIXI.Rectangle();
        this.m_textRectScaled = new global.PIXI.Rectangle();
        this.m_fontFile = fontFile;
        this.m_fontSize = fontSize;
        this.m_fontLoaded = false;
        this.m_font = null;
        this.m_labelSprite = null;
        this.m_boundFontLoaderHandler = this._handleFontLoaded.bind(this);
        this.m_tint = color;

        var loadedFont = global.P2TTF.FontManager.fontCache[fontFile];
        if (loadedFont)
        {
            this._handleFontLoaded(null, loadedFont);
        }
        else
        {
            global.P2TTF.FontManager.loadFont(fontFile, this.m_boundFontLoaderHandler);
        }
    }

    /**
     * @inheritance
     * @type { PIXI.DisplayObjectContainer }
     */
    P2TTFLabel.prototype = Object.create(global.PIXI.DisplayObjectContainer.prototype);
    P2TTFLabel.prototype.constructor = P2TTFLabel;

    /**
     * Sets the label's text
     * If the text needs to be rendered it will create a new texture and render the text in it.
     * If a previously created texture exists it will dispose the old texture and create a new one.
     * WARNING: Changing the text too often will incur a performance hit.
     *
     * @property text
     * @type { String }
     */
    Object.defineProperty(P2TTFLabel.prototype, 'text', {
        get: function()
        {
            return this.m_text;
        },

        set: function(value)
        {
            if (this.m_fontLoaded && value != this.m_text)
            {
                this.m_text = value;
                this._renderText();
            }
            else
            {
                this.m_text = value;
            }
        }

    });

    /**
     * Sets the label's tint.
     *
     * @property tint
     * @type { Number }
     * @default 0xFFFFFF
     */
    Object.defineProperty(P2TTFLabel.prototype, 'tint', {
        get: function()
        {
            return this.m_tint;
        },

        set: function(value)
        {
            this.m_tint = value;
            if (this.m_fontLoaded && this.m_labelSprite)
            {
                this.m_labelSprite.tint = value;
            }
        }

    });

    /**
     * The size of the container, this size is not necessarily the same than the size returned by PIXI's display object container.
     *
     * @property size
     * @type { P2GUI.Size }
     * @readonly
     */
    Object.defineProperty(P2TTFLabel.prototype, 'size', {
        get: function()
        {
            this.m_sizeScaled.set(this.m_size.width * this.scale.x, this.m_size.height * this.scale.y);
            return this.m_sizeScaled;
        }
    });

    /**
     * The rect of the text contained by this label, it includes all metrics therefore does not represent a pixel size.
     *
     * @property textRect
     * @type { PIXI.Rectangle }
     * @readonly
     */
    Object.defineProperty(P2TTFLabel.prototype, 'textRect', {
        get: function()
        {
            this.m_textRectScaled.x = this.m_textRect.x * this.scale.x;
            this.m_textRectScaled.y = this.m_textRect.y * this.scale.y;
            this.m_textRectScaled.width = this.m_textRect.width * this.scale.x;
            this.m_textRectScaled.height = this.m_textRect.height * this.scale.y;
            return this.m_textRectScaled;
        }
    });

    P2TTFLabel.prototype.destroy = function()
    {
        this.text = null;
        if (this.m_labelSprite)
        {
            this.removeChild(this.m_labelSprite);
            this.m_labelSprite.texture.destroy(true);
            delete this.m_labelSprite;
            this.m_labelSprite = null;
        }

        delete this.m_size;
        delete this.m_sizeScaled;
        delete this.m_textRect;
        delete this.m_textRectScaled;
        delete this.m_font;
        delete this.m_labelSprite;
        delete this.m_boundFontLoaderHandler;
    };

    /**
     * Method that handles font loading.
     *
     * @param error
     * @param font
     * @private
     */
    P2TTFLabel.prototype._handleFontLoaded = function(error, font)
    {
        if (error)
        {
            this.m_font = null;
            this.m_fontLoaded = false;
            console.log(this.m_fontFile);
            console.log(error);
        }
        else
        {
            this.m_font = font;
            this.m_fontLoaded = true;
            this._renderText();
        }
    };



    /**
     * Updates the rendered text
     *
     * @method _renderText
     * @private
     */
    P2TTFLabel.prototype._renderText = function() // WARNING: This rendering function was eyeballed for PACO // TODO: Make rendering more flexible
    {
        if (this.m_labelSprite)
        {
            this.removeChild(this.m_labelSprite);
            this.m_labelSprite.texture.destroy(true);
            delete this.m_labelSprite;
            this.m_labelSprite = null;
        }

        /* if the text field is empty/null/undefined do not render anything */
        if (!this.m_text) return;

        var canvas = document.createElement("canvas");
        canvas.width = this.m_size.width;
        canvas.height = this.m_size.height;
        var context = canvas.getContext("2d");

        var head = this.m_font.tables.head;
        var hhea = this.m_font.tables.hhea;
        var os2 = this.m_font.tables.os2;
        var maxHeight = os2.sTypoAscender * 1.025;
        var maxWidth = head.xMax - head.xMin;
        var baseline = this.m_size.height * 0.95;
        var fontScale = (this.m_fontSize / this.m_font.unitsPerEm);//Math.min(this.m_size.width/(head.xMax - head.xMin), this.m_size.height/maxHeight);
        var fontSize = this.m_fontSize;//fontScale * (this.m_font.unitsPerEm);
        //var path = this.m_font.getPath(this.m_text, 0, baseline, /*this.m_fontSize*/ fontScale * this.m_font.unitsPerEm); /* TODO: Use the passed font size */

        var glyphs = this.m_font.stringToGlyphs(this.m_text);
        var glyph;
        var i, n;
        var textWidth = 0;
        for (i = 0, n = glyphs.length; i < n; ++i)
        {
            glyph = glyphs[i];
            if (glyph.advanceWidth) {
                textWidth += glyph.advanceWidth * fontScale;
            }
            /* TODO: Add kerning support */
        }

        var offset = (this.m_size.width - textWidth) * 0.5;
        var fullPath = new global.opentype.Path();
        var textX = 0;
        for (i = 0, n = glyphs.length; i < n; ++i)
        {
            glyph = glyphs[i];
            var path = glyph.getPath(offset + textX, baseline, fontSize);
            fullPath.extend(path);
            if (glyph.advanceWidth) {
                textX += glyph.advanceWidth * fontScale;
            }
        }

        fullPath.fill = "#ffffff";
        fullPath.draw(context);

        var texture = PIXI.Texture.fromCanvas(canvas);
        this.m_labelSprite = new PIXI.Sprite(texture, new PIXI.Rectangle(0, 0, this.m_size.width, this.m_size.height));
        this.m_labelSprite.tint = this.m_tint;

        this.addChild(this.m_labelSprite);

        this.m_textRect.x = offset;
        this.m_textRect.y = this.m_size.height;
        this.m_textRect.width = textWidth;
        this.m_textRect.height = this.m_size.height;
    };

    P2TTFLabel.createP2GUIInstance = function(layout, elementDescription, desiredRect, callbacks, onCreated)
    {
        P2TTFLabel.createP2GUIClassInstance(P2TTFLabel, layout, elementDescription, desiredRect, callbacks, onCreated);
    };

    P2TTFLabel.createP2GUIClassInstance = function(classDefinition, layout, elementDescription, desiredRect, callbacks, onCreated)
    {
        var textKey = elementDescription["properties"]["textKey"];
        if (!textKey)
        {
            console.log("P2TTF.Label ERROR: Element " + elementDescription["name"] + " is not a text element");
            global.P2GUI.Importer.createMissingClassImporterElement(layout, elementDescription, desiredRect, callbacks, onCreated);
        }
        else
        {
            var textKeyTransform = textKey["transform"];
            var fontScale = new global.PIXI.Point(1.0, 1.0);
            if (textKeyTransform)
            {
                fontScale.set(parseFloat(textKeyTransform["xx"]), parseFloat(textKeyTransform["yy"]));
            }

            var textStyle = textKey["textStyleRange"][0]["textStyle"];
            var paragraphStyle = textKey["paragraphStyleRange"][0]["paragraphStyle"];

            var fontName = textStyle["fontPostScriptName"];
            var fontTechnology = parseInt(textStyle["fontTechnology"]);
            var fontExtension;
            if (fontTechnology == 0)
            {
                fontExtension = "otf";
            }
            else
            {
                if (fontTechnology != 1)
                {
                    console.log("P2TTF.Label WARNING: Unknown font technology, defaulting to TTF.");
                }
                fontExtension = "ttf";
            }

            var fontSize = Math.floor(parseFloat(textStyle["size"]) * fontScale.y * layout.preferredScale);
            var leading = parseFloat(textStyle["leading"]) * fontScale.y;
            var kerning = parseFloat(textStyle["tracking"]);

            // get the object properties //
            var elementName = elementDescription["name"];
            var elementID = elementDescription["id"];
            var textShapeBounds = textKey["textShape"][0]["bounds"];
            if (textShapeBounds)
            {
                /*TODO*/
//                CGSize shapeSize = [GSGGUI_Shared getScaledSizeFromBoundsDescription:textShapeBounds];
//                shapeSize.width *= fontScale.x;
//                shapeSize.height *= fontScale.y;
//                size.width = MAX(size.width, shapeSize.width);
//                size.height = MAX(size.height, shapeSize.height);
            }

            var alignment = paragraphStyle["align"];

            var fontPath = callbacks.providePathForAsset(layout.name, fontName + "." + fontExtension);
            if (!fontPath)
            {
                fontPath = fontName + "." + fontExtension;
            }

            var text = callbacks.provideCaptionForLabel(layout.name, elementName, elementID);
            if (!text)
            {
                text = textKey["textKey"];
            }

            var colorDescription = textStyle["color"];
            var color = global.PIXI.rgb2hex([colorDescription["red"] / 255, colorDescription["grain"] / 255, colorDescription["blue"] / 255]);

            var label = new classDefinition(desiredRect, text, fontPath, fontSize, color);
            label.position.set(desiredRect.x, desiredRect.y);

            onCreated(label, elementName, elementID);
        }
    };

    /**
     * @export P2TTF.Label
     * @type { Label }
     */
    global.P2TTF.Label = P2TTFLabel;

}(this));
 