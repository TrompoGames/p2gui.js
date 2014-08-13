(function()
{
	/* infomration */
	var updateInformation = function()
	{
		updateMetadataAndGUI(P2GUI.element.information, P2GUI.element.informationDefaults);
	};
	
	var updateLayout = function()
	{
		updateMetadataAndGUI(P2GUI.element.layout, P2GUI.element.layoutDefaults);
	};
	
	var informationUpdateEvent = null;
	var layoutUpdateEvent = null;
	
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
							relative.val(P2GUI.value.relativeH);
							relative.blur();
						}
						else if (newValue == P2GUI.value.snap)
						{
							snapTo.show();
							relative.hide();
						}
					}),
					
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
							relative.val(P2GUI.value.relativeV);
							relative.blur();
						}
						else if (newValue == P2GUI.value.snap)
						{
							snapTo.show();
							relative.hide();
						}
					}),
					
			horizontalRelative		: P2GUI.eventManager.on("onChanged_" + P2GUI.element.layout.horizontalRelative, function(newValue)
					{
						var element = jQuery("#" + P2GUI.element.layout.horizontalRelative);
						
						if (isNaN(newValue))
						{
							element.val(P2GUI.value.relativeH);
							element.blur();
						}
						else
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
						else
						{
							csInterface.evalScript("setLayerRelativeY(" + newValue + ")");
						}
					}),
	};
	
})();
