/**
 * Created by dario on 2014-09-14.
 */

(function (global)
{
    global.PIXI.Sprite.createP2GUIInstance = function(layout, elementDescription, desiredRect, callbacks, onCreated)
    {
        global.PIXI.Sprite.createP2GUIClassInstance(global.PIXI.Sprite, layout, elementDescription, desiredRect, callbacks, onCreated);
    };

    /**
     * Creates an instance of the class definition supplied using the P2GUI description. Useful for inheritance.
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
    global.PIXI.Sprite.createP2GUIClassInstance = function(classDefinition, layout, elementDescription, desiredRect, callbacks, onCreated)
    {
        var elementName = elementDescription["name"];
        var elementID = elementDescription["id"];

        var frameName = elementID;
        if (!frameName)
        {
            frameName = elementName;
        }

        if (frameName.indexOf(".png", frameName.length - 4) === -1)
        {
            frameName += ".png";
        }

        var sprite = null;
        try
        {
            sprite = global.PIXI.Sprite.fromFrameWithClass(frameName, classDefinition);
        }
        catch (e)
        {
            console.log("ERROR: The frame name \"" + frameName + "\" was not loaded. Make sure the frame is available in a loaded texture atlas!");
            sprite = global.P2GUI.Importer.createMissingAssetImporterElement(layout, elementDescription, desiredRect, callbacks, onCreated);
            return;
        }

        var misc = elementDescription["misc"];
        if (misc && misc["arbitraryScale"])
        {
            sprite.width = desiredRect.width;
            sprite.height = desiredRect.height;
        }
        else
        {
            var newScale = Math.min(desiredRect.width / sprite.width, desiredRect.height / sprite.height);
            sprite.width = Math.floor(sprite.width * newScale);
            sprite.height = Math.floor(sprite.height * newScale);
        }

        if (misc)
        {
            if (misc["tint"])
            {
                var tint = parseInt(misc["tint"]);
                sprite.tint = isNaN(tint) ? 0xFFFFFF : tint;
            }
            sprite.rotation = (misc["rotation"] || 0) * (Math.PI / 180);
        }

        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(desiredRect.x + Math.floor(desiredRect.width * 0.5), desiredRect.y + Math.floor(desiredRect.height * 0.5));
        onCreated(sprite, elementName, elementID);
    };

    /**
     *
     * Helper function that creates a sprite that will contain a texture from the TextureCache based on the frameId
     * The frame ids are created when a Texture packer file has been loaded
     *
     * @method fromFrame
     * @static
     * @param frameId {String} The frame Id of the texture in the cache
     * @return {Sprite} A new Sprite using a texture from the texture cache matching the frameId
     */
    global.PIXI.Sprite.fromFrameWithClass = function(frameId, classDefinition)
    {
        var texture = global.PIXI.TextureCache[frameId];
        if(!texture) throw new Error('The frameId "' + frameId + '" does not exist in the texture cache' + this);
        return new classDefinition(texture);
    };

})(this);
