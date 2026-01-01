/**
 * jQuery UI Modern Fallback
 * 
 * Provides fallback implementations for jQuery UI components that have been removed
 * to support ClassicPress 3.0+ compatibility.
 * 
 * Replaces:
 * - accordion() with CSS-based collapse/expand
 * - sortable() with SortableJS
 * - datepicker() with HTML5 date input
 * - droppable() with HTML5 drag-drop API
 * 
 * @package CoursePress
 * @since 1.0.0
 */

(function( $ ) {
    'use strict';

    // Polyfill for $.fn.accordion() - Simple CSS-based accordion
    if ( typeof $.fn.accordion !== 'function' ) {
        $.fn.accordion = function( options ) {
            var defaults = $.extend({
                active: 0,
                collapsible: false,
                disabled: false,
                event: 'click'
            }, options);

            return this.each(function() {
                var $accordion = $(this);
                var $headers = $accordion.find('> h3, > .accordion-header');
                var $panels = $accordion.find('> .accordion-panel, > .accordion-content');

                // Handle string commands
                if ( typeof options === 'string' ) {
                    switch( options ) {
                        case 'destroy':
                            $accordion.removeClass('ui-accordion');
                            $headers.removeClass('ui-accordion-header').off('click');
                            $panels.removeClass('ui-accordion-panel');
                            break;
                        case 'enable':
                            $accordion.data('accordion-disabled', false);
                            break;
                        case 'disable':
                            $accordion.data('accordion-disabled', true);
                            break;
                        case 'refresh':
                            // Reinitialize
                            $headers = $accordion.find('> h3, > .accordion-header');
                            $panels = $accordion.find('> .accordion-panel, > .accordion-content');
                            setupAccordion();
                            break;
                        case 'option':
                            if ( arguments[1] ) {
                                if ( arguments[2] !== undefined ) {
                                    var optName = arguments[1];
                                    if ( optName === 'active' && $accordion.data('accordion-disabled') !== true ) {
                                        showPanel(arguments[2]);
                                    }
                                } else {
                                    return $accordion.data('accordion-options');
                                }
                            }
                            break;
                    }
                    return;
                }

                // Initialize accordion
                var setupAccordion = function() {
                    $accordion.addClass('ui-accordion');
                    $headers.addClass('ui-accordion-header');
                    $headers.attr('tabindex', '-1'); // Remove from tab order, prevent focus outline
                    $headers.css('outline', 'none'); // Disable outline
                    $panels.addClass('ui-accordion-panel').hide();

                    // Show active panel
                    if ( defaults.active !== false ) {
                        $panels.eq(defaults.active).show();
                        $headers.eq(defaults.active).addClass('ui-state-active').attr('aria-selected', 'true');
                    }

                    // Click handler
                    $headers.on('click', function(e) {
                        // Prevent focus/text selection
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if ( $accordion.data('accordion-disabled') ) {
                            return;
                        }

                        var index = $headers.index(this);
                        var $panel = $panels.eq(index);

                        if ( $panel.is(':visible') && defaults.collapsible ) {
                            $panel.slideUp(200);
                            $(this).removeClass('ui-state-active').attr('aria-selected', 'false');
                        } else {
                            $panels.slideUp(200);
                            $headers.removeClass('ui-state-active').attr('aria-selected', 'false');
                            $panel.slideDown(200);
                            $(this).addClass('ui-state-active').attr('aria-selected', 'true');
                        }
                    });
                };

                var showPanel = function(index) {
                    $panels.hide();
                    $headers.removeClass('ui-state-active').attr('aria-selected', 'false');
                    $panels.eq(index).show();
                    $headers.eq(index).addClass('ui-state-active').attr('aria-selected', 'true');
                };

                setupAccordion();
                $accordion.data('accordion-options', defaults);
            });
        };
    }

    // Polyfill for $.fn.sortable() - Use SortableJS
    if ( typeof $.fn.sortable !== 'function' && typeof Sortable !== 'undefined' ) {
        $.fn.sortable = function( options ) {
            var defaults = $.extend({
                group: 'sortable',
                animation: 150,
                ghostClass: 'ui-state-highlight',
                dragClass: 'ui-sortable-dragging',
                onEnd: null
            }, options);

            return this.each(function() {
                var $elem = $(this);
                var sortableInstance = new Sortable(this, {
                    group: defaults.group,
                    animation: defaults.animation,
                    ghostClass: defaults.ghostClass,
                    dragClass: defaults.dragClass,
                    onEnd: function(evt) {
                        if ( defaults.onEnd ) {
                            defaults.onEnd.call($elem, evt);
                        }
                        // Trigger jQuery change event for compatibility
                        $elem.trigger('sortupdate', [evt]);
                    }
                });

                // Handle string commands
                if ( typeof options === 'string' ) {
                    switch( options ) {
                        case 'destroy':
                            sortableInstance.destroy();
                            break;
                        case 'enable':
                            sortableInstance.option('disabled', false);
                            break;
                        case 'disable':
                            sortableInstance.option('disabled', true);
                            break;
                    }
                    return;
                }

                $elem.data('sortable-instance', sortableInstance);
            });
        };
    }

    // Polyfill for $.fn.datepicker() - Use HTML5 input[type="date"]
    if ( typeof $.fn.datepicker !== 'function' ) {
        $.fn.datepicker = function( options ) {
            if ( typeof options === 'string' ) {
                // Handle string commands
                switch( options ) {
                    case 'show':
                        return this.each(function() {
                            if ( $(this).attr('type') === 'text' ) {
                                $(this).attr('type', 'date');
                            }
                        });
                    case 'hide':
                        return this.each(function() {
                            if ( $(this).attr('type') === 'date' ) {
                                $(this).blur();
                            }
                        });
                    case 'destroy':
                        return this.each(function() {
                            if ( $(this).attr('type') === 'date' ) {
                                $(this).attr('type', 'text');
                            }
                        });
                }
                return;
            }

            // Initialize datepicker
            return this.each(function() {
                var $input = $(this);
                
                // Convert to HTML5 date input if not already
                if ( $input.attr('type') === 'text' ) {
                    $input.attr('type', 'date');
                    $input.addClass('datepicker-html5');
                }
            });
        };
    }

    // Polyfill for $.fn.droppable() - Use HTML5 Drag-Drop API
    if ( typeof $.fn.droppable !== 'function' ) {
        $.fn.droppable = function( options ) {
            var defaults = $.extend({
                accept: '*',
                drop: null,
                over: null,
                out: null
            }, options);

            return this.each(function() {
                var $dropzone = $(this);

                // Prevent default drag behavior
                $dropzone.on('dragover dragenter', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $dropzone.addClass('ui-state-hover');
                    
                    if ( defaults.over ) {
                        defaults.over.call(this, e);
                    }
                    return false;
                });

                $dropzone.on('dragleave', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $dropzone.removeClass('ui-state-hover');
                    
                    if ( defaults.out ) {
                        defaults.out.call(this, e);
                    }
                });

                $dropzone.on('drop', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $dropzone.removeClass('ui-state-hover');

                    var draggedElement = e.dataTransfer && e.dataTransfer.getData('text/html');
                    
                    if ( defaults.drop ) {
                        defaults.drop.call(this, e, { draggable: draggedElement });
                    }

                    // Trigger jQuery event
                    $dropzone.trigger('drop', [e]);
                    return false;
                });

                $dropzone.data('droppable', true);
            });
        };
    }

    // Polyfill for $.fn.draggable() - Use HTML5 Drag-Drop API
    if ( typeof $.fn.draggable !== 'function' ) {
        $.fn.draggable = function( options ) {
            var defaults = $.extend({
                distance: 0,
                delay: 0,
                revert: false,
                start: null,
                drag: null,
                stop: null
            }, options);

            return this.each(function() {
                var $elem = $(this);
                
                // Make element draggable
                $elem.attr('draggable', 'true');
                $elem.addClass('ui-draggable');

                $elem.on('dragstart', function(e) {
                    $elem.addClass('ui-draggable-dragging');
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/html', $elem.html());
                    
                    if ( defaults.start ) {
                        defaults.start.call(this, e);
                    }
                });

                $elem.on('dragend', function(e) {
                    $elem.removeClass('ui-draggable-dragging');
                    
                    if ( defaults.stop ) {
                        defaults.stop.call(this, e);
                    }

                    // Trigger jQuery event
                    $elem.trigger('dragstop', [e]);
                });

                $elem.data('draggable', true);
            });
        };
    }

    // Polyfill for $.fn.spinner() - HTML5 number input enhancement
    if ( typeof $.fn.spinner !== 'function' ) {
        $.fn.spinner = function( options ) {
            var defaults = $.extend({
                min: null,
                max: null,
                step: 1,
                spin: null,
                change: null
            }, options);

            return this.each(function() {
                var $input = $(this);

                // Only work on number inputs
                if ( $input.attr('type') !== 'number' ) {
                    $input.attr('type', 'number');
                }

                // Add min/max attributes if provided
                if ( defaults.min !== null ) {
                    $input.attr('min', defaults.min);
                }
                if ( defaults.max !== null ) {
                    $input.attr('max', defaults.max);
                }
                if ( defaults.step ) {
                    $input.attr('step', defaults.step);
                }

                // Add spinner styling
                $input.addClass('ui-spinner-input');

                // Handle change events
                $input.on('change', function(e) {
                    if ( defaults.change ) {
                        defaults.change.call(this, e);
                    }
                    $input.trigger('spinchange');
                });

                $input.data('spinner', true);
            });
        };
    }

    // Polyfills for jQuery Effects methods (slideUp, slideDown, fadeIn, fadeOut, etc.)
    // These use CSS transitions instead of jQuery Effects library
    if ( typeof $.fn.slideUp !== 'function' || !$.fn.slideUp.toString().includes('animate') ) {
        $.fn.slideUp = function( duration, callback ) {
            duration = duration || 200;
            
            return this.each(function() {
                var $el = $(this);
                
                // Use CSS transition for smooth animation
                $el.css({
                    'transition': 'height ' + (duration / 1000) + 's ease-in-out',
                    'overflow': 'hidden'
                });
                
                // Trigger reflow to apply the transition
                void $el[0].offsetHeight;
                
                // Animate the height
                $el.css('height', '0');
                
                // After animation completes, hide and reset styles
                setTimeout(function() {
                    $el.css('height', '');
                    $el.hide();
                    $el.css('transition', '');
                    
                    if ( typeof callback === 'function' ) {
                        callback();
                    }
                }, duration);
            });
        };
    }

    if ( typeof $.fn.slideDown !== 'function' || !$.fn.slideDown.toString().includes('animate') ) {
        $.fn.slideDown = function( duration, callback ) {
            duration = duration || 200;
            
            return this.each(function() {
                var $el = $(this);
                
                // Show element first to get its natural height
                $el.css('display', '');
                if ( $el.css('display') === 'none' ) {
                    $el.css('display', 'block');
                }
                
                var fullHeight = $el[0].scrollHeight;
                
                // Set height to 0 and prepare for animation
                $el.css({
                    'height': '0',
                    'overflow': 'hidden',
                    'transition': 'height ' + (duration / 1000) + 's ease-in-out'
                });
                
                // Trigger reflow to apply the transition
                void $el[0].offsetHeight;
                
                // Animate to full height
                $el.css('height', fullHeight + 'px');
                
                // After animation completes, reset styles
                setTimeout(function() {
                    $el.css('height', '');
                    $el.css('transition', '');
                    $el.css('overflow', '');
                    
                    if ( typeof callback === 'function' ) {
                        callback();
                    }
                }, duration);
            });
        };
    }

    if ( typeof $.fn.fadeIn !== 'function' ) {
        $.fn.fadeIn = function( duration, callback ) {
            duration = duration || 400;
            
            return this.each(function() {
                var $el = $(this);
                
                $el.css({
                    'opacity': '0',
                    'transition': 'opacity ' + (duration / 1000) + 's ease-in-out',
                    'display': 'block'
                });
                
                // Trigger reflow
                void $el[0].offsetHeight;
                
                $el.css('opacity', '1');
                
                setTimeout(function() {
                    $el.css('transition', '');
                    if ( typeof callback === 'function' ) {
                        callback();
                    }
                }, duration);
            });
        };
    }

    if ( typeof $.fn.fadeOut !== 'function' ) {
        $.fn.fadeOut = function( duration, callback ) {
            duration = duration || 400;
            
            return this.each(function() {
                var $el = $(this);
                
                $el.css({
                    'opacity': '1',
                    'transition': 'opacity ' + (duration / 1000) + 's ease-in-out'
                });
                
                // Trigger reflow
                void $el[0].offsetHeight;
                
                $el.css('opacity', '0');
                
                setTimeout(function() {
                    $el.hide();
                    $el.css('transition', '');
                    if ( typeof callback === 'function' ) {
                        callback();
                    }
                }, duration);
            });
        };
    }

})( jQuery );
