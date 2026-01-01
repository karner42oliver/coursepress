/**
 * jQuery UI Polyfill for ClassicPress 2.2.0+
 * 
 * Provides fallback implementations for jQuery UI components that are deprecated
 * or removed in newer versions of ClassicPress.
 * 
 * @package CoursePress
 * @since 1.0.0
 */

( function( $ ) {
	'use strict';

	// Check if jQuery UI exists, if not, create a minimal polyfill
	if ( typeof jQuery.ui === 'undefined' ) {
		jQuery.ui = {};
	}

	// Minimal polyfill for jQuery UI Widget factory
	if ( typeof jQuery.Widget === 'undefined' ) {
		jQuery.Widget = function( name, base_class, prototype ) {
			// This is a minimal stub - the actual jQuery UI should handle this
		};
	}

	// Ensure jQuery UI widgets exist (even if empty)
	var ui_widgets = [
		'accordion',
		'datepicker',
		'dialog',
		'draggable',
		'droppable',
		'menu',
		'mouse',
		'progressbar',
		'resizable',
		'selectable',
		'slider',
		'sortable',
		'spinner',
		'tabs',
		'tooltip'
	];

	ui_widgets.forEach( function( widget ) {
		if ( typeof jQuery.fn[ widget ] === 'undefined' ) {
			jQuery.fn[ widget ] = function() {
				// Log warning if called in console
				console.warn( 'jQuery UI ' + widget + ' is not available. Install jQuery UI to enable this feature.' );
				return this;
			};
		}
	});

	// Polyfill for jQuery UI effects
	if ( typeof jQuery.effects === 'undefined' ) {
		jQuery.effects = {};
	}

	var effects = [ 'highlight', 'shake', 'slide', 'drop', 'fade' ];
	effects.forEach( function( effect ) {
		if ( typeof jQuery.fx.speeds !== 'object' ) {
			jQuery.fx.speeds = {
				slow: 600,
				fast: 200
			};
		}
	});

} )( jQuery );
