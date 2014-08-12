(function()
{
	/* infomration */
	var infomration = {
			
			onEnter					: P2GUI.eventManager.on("onEnter_element_information", function()
					{
						updateMetadataAndGUI(P2GUI.element.information, P2GUI.element.informationDefaults);
					}),
					
			elementNameChanged		: P2GUI.eventManager.on("onChanged_" + P2GUI.element.information.name, function(newValue)
					{
						/* assign the new name to the layer name */
						var newName = decodeURI(newValue);
						csInterface.evalScript("getLayerName()", function(result)
						{
							if (result != newName)
							{
								csInterface.evalScript("setLayerName(\"" + decodeURI(newValue) + "\")");
							}
						});
					}),
	}
})();
