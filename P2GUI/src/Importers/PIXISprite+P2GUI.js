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

        var sprite = null
        try
        {
            sprite = global.PIXI.Sprite.fromFrame(frameName);
            var misc = misc = JSON.parse(elementDescription["misc"]);
            if (misc && misc["arbitraryScale"])
            {
                sprite.width = desiredRect.width;
                sprite.height = desiredRect.height;
            }
            else
            {
                var newScale = Math.min(desiredRect.width / sprite.width, desiredRect.height / sprite.height);
                sprite.width *= newScale;
                sprite.height *= newScale;
            }
            sprite.anchor.set(0.5, 0.5);
            sprite.position.set(desiredRect.x + (desiredRect.width * 0.5), desiredRect.y + (desiredRect.height * 0.5));
            onCreated(sprite, elementName, elementID);
        }
        catch (e)
        {
            console.log("ERROR: The frame name \"" + frameName + "\" was not loaded. Make sure the frame is available in a loaded texture atlas!");
            sprite = global.P2GUI.Importer.createMissingAssetImporterElement(layout, elementDescription, desiredRect, callbacks, onCreated);
        }
    }
})(this);
