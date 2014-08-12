(function()
{
	/* infomration */
	var infomration = {
			
			onEnter					: P2GUI.eventManager.on("onEnter_element_information", function()
					{
						updateMetadataAndGUI(P2GUI.element.information, P2GUI.element.informationDefaults);
					}),
	}
})();
