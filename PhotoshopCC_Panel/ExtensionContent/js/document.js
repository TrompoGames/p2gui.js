(function()
{
	/* configuration */
	var configuration = {
			
			onEnter					: P2GUI.eventManager.on("onEnter_document_configuration", function()
					{
						updateMetadataAndGUI(P2GUI.document.configuration, P2GUI.document.configurationDefaults);
					}),
			
			autoClassTypeChanged	: P2GUI.eventManager.on("onChanged_" + P2GUI.document.configuration.autoClassType, function(newValue)
					{
						/* if it's not set to custom hide the corresponding text field, otherwise show it */
						var element = jQuery("#" + P2GUI.document.configuration.autoClassDescriptor);
						if (newValue == P2GUI.value.custom)
						{
							element.parent().show();
						}
						else
						{
							element.parent().hide();
						}
					}),
					
			classFieldsTypeChanged	: P2GUI.eventManager.on("onChanged_" + P2GUI.document.configuration.classFieldsType, function(newValue)
					{
						/* if it's not set to custom hide the corresponding text field, otherwise show it */
						var element = jQuery("#" + P2GUI.document.configuration.classFieldsDescriptor);
						if (newValue == P2GUI.value.custom)
						{
							element.parent().show();
						}
						else
						{
							element.parent().hide();
						}
					})
	}
})();