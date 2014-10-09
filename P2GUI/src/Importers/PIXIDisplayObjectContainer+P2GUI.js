/**
 * Created by dario on 2014-10-08.
 */

(function (global)
{
    global.PIXI.DisplayObjectContainer.createP2GUIInstance = function(layout, elementDescription, desiredRect, callbacks, onCreated)
    {
        var elementName = elementDescription["name"];
        var elementID = elementDescription["id"];

        var group = new global.PIXI.DisplayObjectContainer();
        group.preferredScale = layout.preferredScale;
        group.exportRect = elementDescription["rect"];
        group.importRect = desiredRect;
        group.position.set(desiredRect.x, desiredRect.y);

//        var bounds = global.P2GUI.Importer.createErrorRectangle(0x0000FF, 0xAAAAFF, new global.PIXI.Rectangle(0, 0, desiredRect.width, desiredRect.height));
//        group.addChild(bounds);

        var children = elementDescription["children"];
        if (children && children.length > 0)
        {
            global.P2GUI.Importer.createElementsInGroup(layout, group, children, layout.classContainer, callbacks, function()
            {
                onCreated(group, elementName, elementID);
            });
        }
        else
        {
            onCreated(group, elementName, elementID);
        }
    }
})(this);

