/**
 * Created by dario on 2014-10-17.
 */

(function (global) {
    "use strict"

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
     */
    function P2TTFLabel(size, text, fontFile, fontSize) {
        /* default values */

        /* init */
        global.PIXI.DisplayObjectContainer.call(this);

        /* private variables */
        this.m_text = text;
        this.m_size = size;
        this.m_textRect = new PIXI.Rectangle();
        this.m_fontFile = fontFile;
        this.m_fontSize = fontSize;
        this.m_fontLoaded = false;
        this.m_font = null;
        this.m_labelSprite = null;
        this.m_boundFontLoaderHandler = this._handleFontLoaded.bind(this);
        this.m_tint = 0xFFFFFF;

        global.opentype.load(fontFile, this.m_boundFontLoaderHandler);
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
            return this.m_size;
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
            return this.m_textRect;
        }
    });

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
            console.log(error);
        }
        else
        {
            this.m_font = font;
            this.m_fontLoaded = true;
            this._renderText();
        }
    }

    /**
     * Updates the rendered text
     *
     * @method _renderText
     * @private
     */
    P2TTFLabel.prototype._renderText = function()
    {
        if (this.m_labelSprite)
        {
            this.removeChild(this.m_labelSprite);
            this.m_labelSprite.texture.destroy();
            delete this.m_labelSprite;
            this.m_labelSprite = null;
        }

        var canvas = document.createElement("canvas");
        canvas.width = this.m_size.width;
        canvas.height = this.m_size.height;
        var context = canvas.getContext("2d");

        var head = this.m_font.tables.head;
        var hhea = this.m_font.tables.hhea;
        var os2 = this.m_font.tables.os2;
        var maxHeight = os2.sTypoAscender - head.yMin;
        var maxWidth = head.xMax - head.xMin;
        var baseline = this.m_size.height * os2.sTypoAscender / maxHeight;
        var fontScale = Math.min(this.m_size.width/(head.xMax - head.xMin), this.m_size.height/maxHeight);
        var glyphScale = 1 / this.unitsPerEm * fontScale * this.m_font.unitsPerEm;
        var fontSize = fontScale * this.m_font.unitsPerEm;
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
    }

    /**
     * @export P2TTF.Label
     * @type { Label }
     */
    global.P2TTF.Label = P2TTFLabel;

}(this));
 