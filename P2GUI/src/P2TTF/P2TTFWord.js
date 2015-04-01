/**
 * Created by dario on 15-03-31.
 */

(function (global)
{
    "use strict";

    /**
     * @namespace P2TTF
     * @type { Object }
     */
    global.P2TTF = global.P2TTF || {};

    /**
     * Class description
     *
     * @class Word
     * @constructor
     */
    function P2TTFWord(text, font, tracking)
    {
        /* default values */
        text = text || null;
        font = font || null;
        tracking = tracking || 0;

        /* private variables */
        this.m_glyphs = null;
        this.m_offsets = [];
        this.m_unscaledWidth = 0;
        this.m_unscaledHeight = 0;
        this.m_offsetLeft = 0;
        this.m_text = text;
        this.m_font = font;
        this.m_tracking = tracking;

        /* init */
        this.calculateMetrics();
    }

    P2TTFWord.prototype.constructor = P2TTFWord;

    /**
     * The glyphs of this word.
     *
     * @property glyphs
     * @type { Array }
     * @readonly
     */
    Object.defineProperty(P2TTFWord.prototype, 'glyphs', {
        get: function()
        {
            return this.m_glyphs;
        }
    });

    /**
     * The offsets for the glyphs in this word.
     *
     * @property offsets
     * @type { Array }
     * @readonly
     */
    Object.defineProperty(P2TTFWord.prototype, 'offsets', {
        get: function()
        {
            return this.m_offsets;
        }
    });

    /**
     * The width of this word in ems.
     *
     * @property unscaledWidth
     * @type { Number }
     * @readonly
     */
    Object.defineProperty(P2TTFWord.prototype, 'unscaledWidth', {
        get: function()
        {
            return this.m_unscaledWidth;
        }
    });

    /**
     * The height of this word in ems.
     *
     * @property unscaledHeight
     * @type { Number }
     * @readonly
     */
    Object.defineProperty(P2TTFWord.prototype, 'unscaledHeight', {
        get: function()
        {
            return this.m_unscaledHeight;
        }
    });

    /**
     * The left side offset of this word in ems.
     *
     * @property offsetLeft
     * @type { Number }
     * @readonly
     */
    Object.defineProperty(P2TTFWord.prototype, 'offsetLeft', {
        get: function()
        {
            return this.m_offsetLeft;
        }
    });

    /**
     * The string of this word.
     *
     * @property text
     * @type { String }
     */
    P2TTFWord.prototype.text = null; // WTF?;
    Object.defineProperty(P2TTFWord.prototype, 'text', {
        get: function()
        {
            return this.m_text;
        },


        set: function(value)
        {
            this.m_text = value;
            this.calculateMetrics();
        }

    });

    /**
     * The font used for this word.
     *
     * @property font
     * @type { opentype.Font }
     */
    Object.defineProperty(P2TTFWord.prototype, 'font', {
        get: function()
        {
            return this.m_font;
        },


        set: function(value)
        {
            this.m_font = value;
            this.calculateMetrics();
        }

    });

    /**
     * The string of this word.
     *
     * @property text
     * @type { String }
     */
    Object.defineProperty(P2TTFWord.prototype, 'text', {
        get: function()
        {
            return this.m_text;
        },


        set: function(value)
        {
            this.m_text = value;
            this.calculateMetrics();
        }

    });

    /**
     * The tracking of this word. (Photoshop lingo, usually called kerning)
     *
     * @property tracking
     * @type { Number }
     */
    Object.defineProperty(P2TTFWord.prototype, 'tracking', {
        get: function()
        {
            return this.m_tracking;
        },


        set: function(value)
        {
            this.m_tracking = value;
            this.calculateMetrics();
        }

    });

    /**
     * Calculates the metrics of the word.
     *
     * @method calculateMetrics
     */
    P2TTFWord.prototype.calculateMetrics = function()
    {
        if (this.m_font && this.m_text)
        {
            var yMax = 0;
            var tracking = this.m_tracking;
            var offsets = this.m_offsets;
            var offset = 0;
            var glyph;
            var glyphs = this.m_font.stringToGlyphs(this.m_text);
            for (var i = 0, n = glyphs.length; i < n; ++i)
            {
                offsets.push(offset);
                glyph = glyphs[i];
                if (glyph.advanceWidth)
                {
                    offset += glyph.advanceWidth;
                    offset += tracking;
                }

                if (glyph.yMax > yMax)
                {
                    yMax = glyph.yMax;
                }

                if (i === 0)
                {
                    this.m_offsetLeft = -glyph.xMin;
                }
            }

            this.m_glyphs = glyphs;
            this.m_unscaledWidth = offset;
            this.m_unscaledHeight = yMax;
        }
    };

    /**
     * Adds the word to a path so it can be drawn to a context. Returns the scaled width of this word.
     *
     * @method addToPath
     * @param path { opentype.Path } : The path to which the word will be added.
     * @param fontSize { Number } : The desired font size to use.
     * @param fontScale { Number } : The scale of the font (usually fontSize/unitsPerEm)
     * @param offsetX { Number } : The location in the X axis where this word will be added.
     * @param offsetY { Number } : The location of the base line in the Y axis for this word.
     * @returns { Number } : The scaled width of this word.
     */
    P2TTFWord.prototype.addToPath = function(path, fontSize, fontScale, offsetX, offsetY)
    {
        offsetX = offsetX || 0;
        offsetY = offsetY || 0;

        var glyph;
        var glyphs = this.m_glyphs;
        var offsets = this.m_offsets;
        for (var i = 0, n = glyphs.length; i < n; ++i)
        {
            glyph = glyphs[i];
            var glyphPath = glyph.getPath(offsetX + (offsets[i] * fontScale), offsetY, fontSize);
            path.extend(glyphPath);
        }

        return (this.m_unscaledWidth * fontScale);
    };

    /**
     * Static line break word.
     *
     * @type { Word }
     * @static
     */
    P2TTFWord.lineBreak = new P2TTFWord();

    /**
     * Static space word.
     *
     * @type { Word }
     * @static
     */
    P2TTFWord.space = new P2TTFWord();

    /**
     * @export P2TTF.Word
     * @type { Word }
     */
    global.P2TTF.Word = P2TTFWord;

}(this));
 