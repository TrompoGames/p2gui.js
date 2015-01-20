/**
 * Created by dario on 2014-10-08.
 */

(function (global)
{
    global.PIXI.DisplayObjectContainer.createP2GUIInstance = function(layout, elementDescription, desiredRect, callbacks, onCreated)
    {
        global.PIXI.DisplayObjectContainer.createP2GUIClassInstance(global.PIXI.DisplayObjectContainer, layout, elementDescription, desiredRect, callbacks, onCreated);
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
    global.PIXI.DisplayObjectContainer.createP2GUIClassInstance = function(classDefinition, layout, elementDescription, desiredRect, callbacks, onCreated)
    {
        var elementName = elementDescription["name"];
        var elementID = elementDescription["id"];

        var group = new classDefinition();
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
    };

})(this);

