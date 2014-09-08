
(function()
{
	/* overrides */
	var overrides = {
			onEnter					: P2GUI.eventManager.on("onEnter_exporter_overrides", function()
					{
						updateMetadataAndGUI(P2GUI.exporter.overrides, P2GUI.exporter.overridesDefaults);
					})
	}
	
	/* export */
	var exportMenu = {
			onExport				: P2GUI.eventManager.on("onClicked_P2GUI_exportDocument", function()
					{
						csInterface.evalScript("setIsExporting(true)",  function(result)
						{
							console.log("one: " + result);
							csInterface.evalScript("exportCurrentDocumentLayout()", function(result)
							{
								console.log("two: " + result);
								setTimeout(function(){csInterface.evalScript("setIsExporting(false)");}, 1);
							});
						});
					})
	}
})();

