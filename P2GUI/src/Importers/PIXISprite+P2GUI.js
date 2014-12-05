/**
 * Created by dario on 2014-09-14.
 */

(function (global)
{
    global.PIXI.Sprite.createP2GUIInstance = function(layout, elementDescription, desiredRect, callbacks, onCreated)
    {
        var elementName = elementDescription["name"];
        var elementID = elementDescription["id"];

        var frameName = elementID;
        if (!frameName)
        {
            frameName = elementName;
        }

        frameName += ".png";

        var sprite = null;
        try
        {
            sprite = global.PIXI.Sprite.fromFrame(frameName);
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
        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(desiredRect.x + Math.floor(desiredRect.width * 0.5), desiredRect.y + Math.floor(desiredRect.height * 0.5));
        onCreated(sprite, elementName, elementID);
    }
})(this);
