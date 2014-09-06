(function()
{
	/* supporting functions */
	var updateInformation = function()
	{
		updateMetadataAndGUI(P2GUI.element.information, P2GUI.element.informationDefaults);
	};
	
	var updateLayout = function()
	{
		updateMetadataAndGUI(P2GUI.element.layout, P2GUI.element.layoutDefaults);
	};
	
	var updateExportOptions = function()
	{
		updateMetadataAndGUI(P2GUI.element.exportOptions, P2GUI.element.exportOptionsDefaults);
	};
	
	var updateRelativeHorizontal = function()
	{
		var element = jQuery("#" + P2GUI.element.layout.horizontalRelative);
		if (element.is(':visible'))
		{
			element.val(P2GUI.value.relativeH);
			element.blur();
		}
	};
	
	var updateRelativeVertical = function()
	{
		var element = jQuery("#" + P2GUI.element.layout.verticalRelative);
		if (element.is(':visible'))
		{
			element.val(P2GUI.value.relativeV);
			element.blur();
		}
	}
	
	/* supporting variables */
	var informationUpdateEvent = null;
	var layoutUpdateEvent = null;
	var exportOptionsUpdateEvent = null;
	
	/* information */
	var infomration = {
			
			onEnter					: P2GUI.eventManager.on("onEnter_element_information", function()
					{
						updateInformation();
						informationUpdateEvent = P2GUI.eventManager.on("onAppEvent_changedLayer", updateInformation);
					}),
					
			onExit					: P2GUI.eventManager.on("onExit_element_information", function()
					{
						if (informationUpdateEvent != null)
						{
							P2GUI.eventManager.off(informationUpdateEvent);
							informationUpdateEvent = null;
						}
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
	};
	
	/* layout */
	var layout = {
			
			onEnter					: P2GUI.eventManager.on("onEnter_element_layout", function()
					{
						updateLayout();
						layoutUpdateEvent = P2GUI.eventManager.on("onAppEvent_changedLayer", updateLayout);
					}),
					
			onExit					: P2GUI.eventManager.on("onExit_element_layout", function()
					{
						if (layoutUpdateEvent != null)
						{
							P2GUI.eventManager.off(layoutUpdateEvent);
							layoutUpdateEvent = null;
						}
					}),
					
			onLayerMoved			: P2GUI.eventManager.on("onAppEvent_move", function()
					{
						updateRelativeHorizontal();
						updateRelativeVertical();
					}),
					
			hotizontalPosition		: P2GUI.eventManager.on("onChanged_" + P2GUI.element.layout.horizontalPosition, function(newValue)
					{
						var snapTo = jQuery("#horizontalSnapBox");
						var relative = jQuery("#horizontalRelativeBox");
						
						if (newValue == P2GUI.value.absolute)
						{
							snapTo.hide();
							relative.hide();
						}
						else if (newValue == P2GUI.value.relative)
						{
							snapTo.hide();
							relative.show();
							var element = jQuery("#" + P2GUI.element.layout.horizontalRelative);
							element.val(P2GUI.value.relativeH);
							element.blur();
						}
						else if (newValue == P2GUI.value.snap)
						{
							snapTo.show();
							relative.hide();
						}
					}),
					
			calculateHorizontal		: P2GUI.eventManager.on("onClicked_P2GUI_obj_layout_horizontal_relative_calculate", updateRelativeHorizontal),
					
			verticalPosition		: P2GUI.eventManager.on("onChanged_" + P2GUI.element.layout.verticalPosition, function(newValue)
					{
						var snapTo = jQuery("#verticalSnapBox");
						var relative = jQuery("#verticalRelativeBox");
						
						if (newValue == P2GUI.value.absolute)
						{
							snapTo.hide();
							relative.hide();
						}
						else if (newValue == P2GUI.value.relative)
						{
							snapTo.hide();
							relative.show();
							var element = jQuery("#" + P2GUI.element.layout.verticalRelative);
							element.val(P2GUI.value.relativeV);
							element.blur();
						}
						else if (newValue == P2GUI.value.snap)
						{
							snapTo.show();
							relative.hide();
						}
					}),
					
			calculateVertical		: P2GUI.eventManager.on("onClicked_P2GUI_obj_layout_vertical_relative_calculate", updateRelativeVertical),
					
			horizontalRelative		: P2GUI.eventManager.on("onChanged_" + P2GUI.element.layout.horizontalRelative, function(newValue)
					{
						var element = jQuery("#" + P2GUI.element.layout.horizontalRelative);
						
						if (isNaN(newValue))
						{
							element.val(P2GUI.value.relativeH);
							element.blur();
						}
						else if (element.is(':visible'))
						{
							csInterface.evalScript("setLayerRelativeX(" + newValue + ")");
						}
					}),
					
			verticalRelative		: P2GUI.eventManager.on("onChanged_" + P2GUI.element.layout.verticalRelative, function(newValue)
					{
						var element = jQuery("#" + P2GUI.element.layout.verticalRelative);
						
						if (isNaN(newValue))
						{
							element.val(P2GUI.value.relativeV);
							element.blur();
						}
						else if (element.is(':visible'))
						{
							csInterface.evalScript("setLayerRelativeY(" + newValue + ")");
						}
					}),
	};
	
	/* export options */
	var exportOptions = {
			onEnter					: P2GUI.eventManager.on("onEnter_element_exportOptions", function()
					{
						updateExportOptions();
						exportOptionsUpdateEvent = P2GUI.eventManager.on("onAppEvent_changedLayer", updateExportOptions);
					}),
					
			onExit					: P2GUI.eventManager.on("onExit_element_exportOptions", function()
					{
						if (exportOptionsUpdateEvent != null)
						{
							P2GUI.eventManager.off(exportOptionsUpdateEvent);
							exportOptionsUpdateEvent = null;
						}
					}),
			
			onExportPNG				: P2GUI.eventManager.on("onClicked_P2GUI_obj_exportConfig_quickExport", function()
					{
						csInterface.evalScript("setIsExporting(true)",  function(result)
						{
							csInterface.evalScript("exportCurrentLayerToPNG()", function(result)
							{
								setTimeout(function(){csInterface.evalScript("setIsExporting(false)");}, 1);
							});
						});
					}),
	};
	
})();
