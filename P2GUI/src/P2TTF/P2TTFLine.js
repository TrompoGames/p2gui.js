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
     * @class Line
     * @constructor
     */
    function P2TTFLine()
    {
        /* default values */

        /* private variables */
        this.m_words = [];
        this.m_emWidth = 0;
        this.m_emHeight = 0;
        this.m_spaceWidth = 0;

        /* init */
    }

    /**
     * Returns an array containing the words in this line.
     *
     * @property words
     * @type { Array }
     * @readonly
     */
    Object.defineProperty(P2TTFLine.prototype, 'words', {
        get: function()
        {
            return this.m_words;
        }
    });

    /**
     * The width of this line in ems.
     *
     * @property emWidth
     * @type { Number }
     * @readonly
     */
    Object.defineProperty(P2TTFLine.prototype, 'emWidth', {
        get: function()
        {
            return this.m_emWidth;
        }
    });

    /**
     * The height of this line in ems.
     *
     * @property emHeight
     * @type { Number }
     * @readonly
     */
    Object.defineProperty(P2TTFLine.prototype, 'emHeight', {
        get: function()
        {
            return this.m_emHeight;
        }
    });

    /**
     * Offset of the first word of this line on the left side. Useful for left aligned paragraphs.
     *
     * @property offsetLeft
     * @type { Number }
     * @readonly
     */
    Object.defineProperty(P2TTFLine.prototype, 'offsetLeft', {
        get: function()
        {
            if (this.m_words.length)
            {
                return this.m_words[0].offsetLeft;
            }

            return 0;
        }
    });

    /**
     * The width, in ems, that a space word should take.
     *
     * @property spaceWidth
     * @type { Number }
     */
    Object.defineProperty(P2TTFLine.prototype, 'spaceWidth', {
        get: function()
        {
            return this.m_spaceWidth;
        },

        set: function(value)
        {
            this.m_spaceWidth = value;
        }
    });

    /**
     * Resets this line by removing the words and resetting the em width and height
     *
     * @method reset
     */
    P2TTFLine.prototype.reset = function()
    {
        this.m_words.length = 0;
        this.m_emWidth = 0;
        this.m_emHeight = 0;
        this.m_spaceWidth = 0;
    };

    /**
     * Adds a word to this line, updating the width and height as needed.
     *
     * @method addWord
     * @param word { Word }: the word to add to this line.
     */
    P2TTFLine.prototype.addWord = function(word)
    {
        this.m_words.push(word);

        if (word === global.P2TTF.Word.space)
        {
            this.m_emWidth += this.m_spaceWidth;
        }
        else if (word !== global.P2TTF.Word.lineBreak)
        {
            this.m_emWidth += word.unscaledWidth;
            if (word.unscaledHeight > this.m_emHeight)
            {
                this.m_emHeight = word.unscaledHeight;
            }
        }
    };

    /**
     * Adds the line to a path so it can be drawn to a context.
     *
     * @method addToPath
     * @param path { opentype.Path } : The path to which the word will be added.
     * @param fontSize { Number } : The desired font size to use.
     * @param fontScale { Number } : The scale of the font (usually fontSize/unitsPerEm)
     * @param offsetX { Number } : The location in the X axis where this word will be added.
     * @param offsetY { Number } : The location of the base line in the Y axis for this word.
     * @returns { Number } : The scaled width of this word.
     */
    P2TTFLine.prototype.addToPath = function(path, fontSize, fontScale, offsetX, offsetY)
    {
        var word;
        var words = this.m_words;
        var spaceWidth = this.m_spaceWidth * fontScale;
        var spaceWord = global.P2TTF.Word.space;
        var lineBreakWord = global.P2TTF.Word.lineBreak;
        for (var i = 0, n = words.length; i < n; ++i)
        {
            word = words[i];
            if (word === spaceWord)
            {
                offsetX += spaceWidth;
            }
            else if (word !== lineBreakWord)
            {
                offsetX += word.addToPath(path, fontSize, fontScale, offsetX, offsetY);
            }
        }
    };

    /**
     * @export P2TTF.Line
     * @type { Line }
     */
    global.P2TTF.Line = P2TTFLine;

}(this));
 