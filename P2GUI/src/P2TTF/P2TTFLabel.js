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
     * @param tracking { Number }: The tracking as configured in photoshop.
     * @param alignment { String }: The alignment of the test.
     */
    function P2TTFLabel(size, text, fontFile, fontSize, color, tracking, alignment) {
        /* default values */
        color = isNaN(parseInt(color)) ? 0xffffff : parseInt(color);
        tracking = tracking || 0;
        alignment = alignment || "left";

        /* init */
        global.PIXI.DisplayObjectContainer.call(this);
        var alignments = {
            left: P2TTFLabel.leftAlignment,
            center: P2TTFLabel.centerAlignment,
            right: P2TTFLabel.rightAlignment
        };

        /* private variables */
        this.m_text = text;
        this.m_size = size;
        this.m_sizeScaled = new global.P2GUI.Size();
        this.m_fontFile = fontFile;
        this.m_fontSize = fontSize;
        this.m_fontLoaded = false;
        this.m_font = null;
        this.m_labelSprite = null;
        this.m_boundFontLoaderHandler = this._handleFontLoaded.bind(this);
        this.m_tint = color;
        this.m_tracking = tracking;
        this.m_alignment = alignments[alignment];

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
     * Destroy this object and all it's members.
     *
     * @method destroy
     */
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
            global.P2GUI.Log(this.m_fontFile);
            global.P2GUI.Log(error);
        }
        else
        {
            this.m_font = font;
            this.m_fontLoaded = true;
            this._renderText();
        }
    };

    /**
     * Extracts the words from a given string using the specified font and tracking.
     *
     * @method _extractWords
     * @param text { String } : The string from which to extract the words from.
     * @param font { opentype.Font } : The font to use in the resulting words.
     * @param tracking { Number } : The tracking to use in the resulting words.
     * @returns { Array } : An array containing the words generated in this function.
     * @private
     */
    P2TTFLabel.prototype._extractWords = function(text, font, tracking)
    {
        var char;
        var words = [];
        var wordText = "";
        for (var i = 0, n = text.length; i < n; ++i)
        {
            char = text[i];
            if (char === " ") // space
            {
                if (wordText !== "")
                {
                    words.push(new global.P2TTF.Word(wordText, font, tracking));
                    wordText = "";
                }
                words.push(global.P2TTF.Word.space);
            }
            else if (char === "\n" || char === "\r" || char === "\u0003")
            {
                if (wordText !== "")
                {
                    words.push(new global.P2TTF.Word(wordText, font, tracking));
                    wordText = "";
                }
                words.push(global.P2TTF.Word.lineBreak);
            }
            else
            {
                wordText += char;
            }
        }

        if (wordText !== "")
        {
            words.push(new global.P2TTF.Word(wordText, font, tracking));
        }

        return words;
    };

    /**
     * Uses the given word array to build lines to be rendered.
     *
     * @param words { Array }: The words to use to build the lines.
     * @param spaceWidth { Number }: The width, in ems, that a space word should take.
     * @returns { Array }: An array containing the lines computed by this function.
     * @private
     */
    P2TTFLabel.prototype._buildLines = function(words, spaceWidth)
    {
        var word;
        var line = null;
        var lines = [];
        //var spaceWord = global.P2TTF.Word.space; // not used yet
        var lineBreakWord = global.P2TTF.Word.lineBreak;

        for (var i = 0, n = words.length - 1; i <= n; ++i) /* we need to know the last index in the array so use n to save it */
        {
            if (!line)
            {
                line =  new global.P2TTF.Line();
                line.spaceWidth = spaceWidth;
            }

            word = words[i];
            line.addWord(word);

            if (word === lineBreakWord || i === n)
            {
                lines.push(line);
                line = null;
            }
        }

        return lines;
    };

    /**
     * Updates the rendered text
     *
     * @method _renderText
     * @private
     */
    P2TTFLabel.prototype._renderText = function() // TODO: Make rendering more flexible
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

        var canvas = null;
        var context = null;
        if (global.Ejecta && global.Ejecta.P2TTFNativeRenderer) /* native renderer used in P2Platform */
        {
            context = new global.Ejecta.P2TTFNativeRenderer(this.m_size.width, this.m_size.height);
            canvas = context;
        }
        else /* fallback to canvas renderer */
        {
            canvas = document.createElement("canvas");
            canvas.width = this.m_size.width;
            canvas.height = this.m_size.height;
            context = canvas.getContext("2d");
        }

        var hhea = this.m_font.tables.hhea;

        var fontSize = this.m_fontSize;
        var fontScale = (fontSize / this.m_font.unitsPerEm);

        var words = this._extractWords(this.m_text, this.m_font, this.m_tracking);
        var spaceWidth = (this.m_font.charToGlyph(" ").advanceWidth + this.m_tracking);
        var lineHeight = ((hhea.ascender - hhea.descender) * fontScale);

        var lines = this._buildLines(words, spaceWidth);

        var alignment = this.m_alignment;
        var left = P2TTFLabel.leftAlignment;
        var center = P2TTFLabel.centerAlignment;
        var right = P2TTFLabel.rightAlignment;
        var canvasWidth = canvas.width;
        var canvasCenter = canvasWidth * 0.5;

        var offsetX = 0;
        var offsetY = (lines[0].minBaseline * fontScale);

        var textPath = new global.opentype.Path();

        var line, i, n;

        /* simple scaling algorithm to force the text to fit in its designated space */
        var emWidth = 0;
        var emHeight = 0;
        for (i = 0, n = lines.length; i < n; ++i)
        {
            line = lines[i];
            if (line.emWidth > emWidth)
            {
                emWidth = line.emWidth;
            }

            if (i)
            {
                emHeight += (hhea.ascender - hhea.descender);
            }
            else
            {
                emHeight += line.emHeight;
            }
        }

        var fitScale = 1;
        if ((emWidth * fontScale * fitScale) > this.m_size.width)
        {
            fitScale *= (this.m_size.width / (emWidth * fontScale * fitScale));
        }

        if ((emHeight * fontScale * fitScale) > this.m_size.height)
        {
            fitScale *= (this.m_size.height / (emHeight * fontScale * fitScale));
        }

        fontSize *= fitScale;
        fontScale *= fitScale;
        lineHeight *= fitScale;
        offsetY *= fitScale;

        for (i = 0, n = lines.length; i < n; ++i)
        {
            line = lines[i];
            if (alignment === left)
            {
                offsetX = (line.offsetLeft * fontScale);
            }
            else if (alignment === center)
            {
                offsetX = (canvasCenter - ((line.emWidth - line.offsetLeft) * fontScale * 0.5));
            }
            else if (alignment === right)
            {
                offsetX = (canvasWidth - (line.emWidth * fontScale));
            }

            line.addToPath(textPath, fontSize, fontScale, offsetX, offsetY);
            offsetY += lineHeight;
        }

        //context.save();
        //context.fillStyle = 'rgba(225,0,0,0.5)';
        //context.fillRect(0,0,canvas.width,canvas.height);
        //context.restore();

        textPath.fill = "#ffffff";
        textPath.draw(context);

        var texture = PIXI.Texture.fromCanvas(canvas);
        this.m_labelSprite = new PIXI.Sprite(texture, new PIXI.Rectangle(0, 0, this.m_size.width, this.m_size.height));
        this.m_labelSprite.tint = this.m_tint;

        this.addChild(this.m_labelSprite);
    };

    /**
     * Left alignment static variable.
     *
     * @type {number}
     * @static
     */
    P2TTFLabel.leftAlignment = 0;

    /**
     * Center alignment static variable.
     *
     * @type {number}
     * @static
     */
    P2TTFLabel.centerAlignment = 1;

    /**
     * Right alignment static variable.
     *
     * @type {number}
     * @static
     */
    P2TTFLabel.rightAlignment = 2;

    /**
     * Default P2GUI instantiation method, this only parses the needed information and creates a new object
     *
     * @method createP2GUIInstance
     * @param layout { P2GUI.Layout }: The layout where the element was supposed to be created.
     * @param elementDescription { Object }: An object containing the element's description, usually from a P2GUI export.
     * @param desiredRect { PIXI.Rectangle }: Rectangle describing the desired size and position of the element.
     * @param callbacks { P2GUI.ImportCallbacks }   : P2GImportCallbacks object configured for this layout.
     * @param onCreated { Function }: Callback function that should be invoked when the object is created.
     * @static
     */
    P2TTFLabel.createP2GUIInstance = function(layout, elementDescription, desiredRect, callbacks, onCreated)
    {
        P2TTFLabel.createP2GUIClassInstance(P2TTFLabel, layout, elementDescription, desiredRect, callbacks, onCreated);
    };

    /**
     * Creates an instance of a P2.Spine using the class definition supplied. Useful for inheritance.
     *
     * @method createP2GUIInstance
     * @param classDefinition { Object }: The class to instantiate as a P2.Spine
     * @param layout { P2GUI.Layout }: The layout where the element was supposed to be created.
     * @param elementDescription { Object }: An object containing the element's description, usually from a P2GUI export.
     * @param desiredRect { PIXI.Rectangle }: Rectangle describing the desired size and position of the element.
     * @param callbacks { P2GUI.ImportCallbacks }   : P2GImportCallbacks object configured for this layout.
     * @param onCreated { Function }: Callback function that should be invoked when the object is created.
     * @static
     */
    P2TTFLabel.createP2GUIClassInstance = function(classDefinition, layout, elementDescription, desiredRect, callbacks, onCreated)
    {
        var textKey = elementDescription["properties"]["textKey"];
        if (!textKey)
        {
            global.P2GUI.Log("P2TTF.Label ERROR: Element " + elementDescription["name"] + " is not a text element");
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
                    global.P2GUI.Log("P2TTF.Label WARNING: Unknown font technology, defaulting to TTF.");
                }
                fontExtension = "ttf";
            }

            var fontSize = Math.floor(parseFloat(textStyle["size"]) * fontScale.y * layout.preferredScale);
            var leading = parseFloat(textStyle["leading"]) * fontScale.y;
            var tracking = parseFloat(textStyle["tracking"]);

            // get the object properties //
            var elementName = elementDescription["name"];
            var elementID = elementDescription["id"];
            var textShapeBounds = textKey["textShape"][0]["bounds"];
            if (textShapeBounds)
            {
                /* calculate the difference between the originally exported bounds and the text shape bounds */
                var shapeWidth = Math.round((textShapeBounds["right"] - textShapeBounds["left"]) * fontScale.x);
                var shapeHeight = Math.round((textShapeBounds["bottom"] - textShapeBounds["top"]) * fontScale.y);


                var exportWidth = elementDescription["rect"].width;
                var exportHeight = elementDescription["rect"].height;

                var widthRatio = desiredRect.width / exportWidth;
                var heightRatio = desiredRect.height / exportHeight;

                /* apply the ratio to the desired rect */
                var newWidth = shapeWidth * widthRatio;
                var newHeight = shapeHeight * heightRatio;

                var keyBoundingBox = textKey["boundingBox"];

                desiredRect.x -= (keyBoundingBox["left"] * fontScale.x * widthRatio);
                desiredRect.y -= (keyBoundingBox["top"] * fontScale.y * heightRatio);

                desiredRect.width = newWidth;
                desiredRect.height = newHeight;
            }

            var alignment = paragraphStyle["align"];

            var fontFile = global.P2GUI.Localization().localizedFont(fontName + "." + fontExtension);

            var fontPath = callbacks.providePathForAsset(layout, fontFile);
            if (!fontPath)
            {
                fontPath = fontFile;
            }

            var text = callbacks.provideCaptionForLabel(layout, elementName, elementID);
            if (!text)
            {
                text = textKey["textKey"];
            }

            var colorDescription = textStyle["color"];
            var color = global.PIXI.rgb2hex([colorDescription["red"] / 255, colorDescription["grain"] / 255, colorDescription["blue"] / 255]);

            var label = new classDefinition(desiredRect, text, fontPath, fontSize, color, tracking, alignment);
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
 