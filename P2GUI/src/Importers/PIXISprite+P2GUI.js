/**
 * Created by dario on 2014-09-14.
 */

(function (global)
{
    global.PIXI.Sprite.createP2GUIInstance = function(layout, elementDescription, desiredRect, callbacks)
    {
        var frameName = elementDescription["id"];
        if (!frameName)
        {
            frameName = elementDescription["name"];
        }

        frameName += ".png";

        var sprite = null
        try
        {
            sprite = global.PIXI.Sprite.fromFrame(frameName);
            sprite.width = desiredRect.width;
            sprite.height = desiredRect.height;
            sprite.anchor.set(0.5, 0.5);
            sprite.position.set(desiredRect.x + (desiredRect.width * 0.5), desiredRect.y + (desiredRect.height * 0.5));
        }
        catch (e)
        {
            console.log("ERROR: The frame name \"" + frameName + "\" was not loaded. Make sure the frame is available in a loaded texture atlas!");
            sprite = global.P2GUI.Importer.createMissingAssetImporterElement(layout, elementDescription, desiredRect, callbacks);
        }

        return sprite;
    }
})(this);
