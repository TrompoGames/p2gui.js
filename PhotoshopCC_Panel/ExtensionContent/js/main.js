window.jQuery = require('./lib/jquery-2.1.1.min.js');

var p2guiEnabled = false;

// jQuery code //
(function($) {
	$(document).foundation = require('./lib/foundation.min.js');

	$(document).ready(function() {
		$(document).foundation({
			offcanvas : {
				// Sets method in which offcanvas opens.
				// [ move | overlap ]
				open_method : 'move',
				// Should the menu close when a menu link is clicked?
				// [ true | false ]
				close_on_click : true
			}
		});

		$('ul.off-canvas-list li a').on('click', function(e) {
			var currentAttrValue = $(this).attr('href');

			// Show/Hide Tabs
			showSection('.main-content ' + currentAttrValue);
			$('.current-section').text($(this).text());

			e.preventDefault();
		});

		$(document).on('open.fndtn.offcanvas', '[data-offcanvas]', function() {
			var off_canvas_wrap = $(this);
			if (!p2guiEnabled) {
				off_canvas_wrap.foundation('offcanvas', 'close', 'move-right');
			}
		});

		reset();
	});

	function showSection(section) {
		var element = $(section);
		element.show().siblings().hide()
		$('.off-canvas-wrap, .inner-wrap, .main-section, .main-content')
				.height("100%");
	}

	function reset() {
		showSection('.main-content #detecting-p2gui');
		$('.current-section').text("P2GUI Toolkit");
		p2guiEnabled = true;
		detectP2GUI();
	}

	function detectP2GUI() {
		// code //
		if (p2guiEnabled) {
			showSection('.main-content #configuration');
			$('.current-section').text("Configuration");
		} else {
			showSection('.main-content #enable-p2gui');
		}
	}
})(jQuery);

// ul.off-canvas-list li a
