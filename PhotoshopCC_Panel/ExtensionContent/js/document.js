(function()
{
	var configuration = P2GUI.eventManager.on("onEnter_document_configuration", function()
	{
		updateMetadataAndGUI(P2GUI.document.configuration, P2GUI.document.configurationDefaults);
	});
})();