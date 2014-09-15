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

        var sprite = PIXI.Sprite.fromFrame(frameName);
        sprite.width = desiredRect.width;
        sprite.height = desiredRect.height;
        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(desiredRect.x + (desiredRect.width * 0.5), desiredRect.y + (desiredRect.height * 0.5));

        return sprite;
    }
})(this);
