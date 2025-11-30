/*!
 * jQuery UI Touch Punch 0.2.3 (Modified for Long Press & Auto-Scroll)
 *
 * Original: Copyright 2011–2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */
(function ($) {

    // Detect touch support
    $.support.touch = 'ontouchend' in document;

    // Ignore browsers without touch support
    if (!$.support.touch) {
        return;
    }

    var mouseProto = $.ui.mouse.prototype,
        _mouseInit = mouseProto._mouseInit,
        _mouseDestroy = mouseProto._mouseDestroy,
        touchHandled;

    /**
     * Simulate a mouse event based on a corresponding touch event
     * @param {Object} event A touch event
     * @param {String} simulatedType The type of mouse event
     */
    function simulateMouseEvent(event, simulatedType) {

        // Ignore multi-touch events
        if (event.originalEvent.touches.length > 1) {
            return;
        }

        // Prevent default only if it's a real event, not our synthetic one
        if (event.preventDefault) {
            event.preventDefault();
        }

        var touch = event.originalEvent.changedTouches[0],
            simulatedEvent = document.createEvent('MouseEvents');

        // Initialize the simulated mouse event using the touch event's coordinates
        simulatedEvent.initMouseEvent(
            simulatedType,    // type
            true,             // bubbles                    
            true,             // cancelable                 
            window,           // view                       
            1,                // detail                     
            touch.screenX,    // screenX                    
            touch.screenY,    // screenY                    
            touch.clientX,    // clientX                    
            touch.clientY,    // clientY                    
            false,            // ctrlKey                    
            false,            // altKey                     
            false,            // shiftKey                   
            false,            // metaKey                    
            0,                // button                     
            null              // relatedTarget              
        );

        // Dispatch the simulated event to the target element
        event.target.dispatchEvent(simulatedEvent);
    }

    /**
     * Handle the jQuery UI widget's touchstart events
     * @param {Object} event The widget element's touchstart event
     */
    mouseProto._touchStart = function (event) {

        var self = this;

        // Ignore the event if another widget is already being handled
        if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
            return;
        }

        // Set the flag for preventing other widgets from inheriting the touch event
        touchHandled = true;

        // Track movement to detect scrolling
        self._touchMoved = false;
        self._touchStarted = false;

        // Store start position to calculate distance
        var touch = event.originalEvent.changedTouches[0];
        self._touchStartX = touch.clientX;
        self._touchStartY = touch.clientY;

        // Store last touch for auto-scroll loop
        self._lastTouch = touch;
        self._lastTarget = event.target;

        // Check for delay option
        var delay = self.options.delay || 0;

        function startDrag() {
            self._touchStarted = true;
            simulateMouseEvent(event, 'mouseover');
            simulateMouseEvent(event, 'mousemove');
            simulateMouseEvent(event, 'mousedown');

            // Start auto-scroll loop
            clearInterval(self._autoScrollTimer);
            self._autoScrollTimer = setInterval(function () {
                if (self._touchStarted && self._lastTouch) {
                    var fakeEvent = {
                        originalEvent: {
                            touches: [],
                            changedTouches: [self._lastTouch]
                        },
                        target: self._lastTarget
                    };
                    simulateMouseEvent(fakeEvent, 'mousemove');
                }
            }, 50);
        }

        if (delay > 0) {
            // Start a timer
            self._touchTimer = setTimeout(function () {
                self._touchTimer = null;
                startDrag();
            }, delay);
        } else {
            startDrag();
        }
    };

    /**
     * Handle the jQuery UI widget's touchmove events
     * @param {Object} event The document's touchmove event
     */
    mouseProto._touchMove = function (event) {
        var self = this;

        // Ignore if not handled
        if (!touchHandled) {
            return;
        }

        // Calculate distance moved
        var touch = event.originalEvent.changedTouches[0];
        var dx = Math.abs(touch.clientX - self._touchStartX);
        var dy = Math.abs(touch.clientY - self._touchStartY);

        // Update last touch for auto-scroll
        self._lastTouch = touch;

        // If waiting for delay (long press)
        if (self._touchTimer) {
            // If moved significantly (scrolling), cancel the timer
            if (dx > 10 || dy > 10) {
                clearTimeout(self._touchTimer);
                self._touchTimer = null;
                touchHandled = false; // Stop handling this touch
                return; // Allow default scrolling
            }
            // If small movement, ignore (wait for timer)
            return;
        }

        // If drag started
        if (self._touchStarted) {
            self._touchMoved = true;
            simulateMouseEvent(event, 'mousemove');
        }
    };

    /**
     * Handle the jQuery UI widget's touchend events
     * @param {Object} event The document's touchend event
     */
    mouseProto._touchEnd = function (event) {
        var self = this;

        // Ignore if not handled
        if (!touchHandled) {
            return;
        }

        // Clear auto-scroll timer
        if (self._autoScrollTimer) {
            clearInterval(self._autoScrollTimer);
            self._autoScrollTimer = null;
        }

        // Cancel timer if it exists
        if (self._touchTimer) {
            clearTimeout(self._touchTimer);
            self._touchTimer = null;
            // Timer didn't fire, so it was a tap/click.
        } else if (self._touchStarted) {
            // Drag happened
            simulateMouseEvent(event, 'mouseup');
            simulateMouseEvent(event, 'mouseout');

            // If we didn't move much, maybe simulate click? 
            // But usually dragging suppresses click.
            if (!self._touchMoved) {
                simulateMouseEvent(event, 'click');
            }
        }

        touchHandled = false;
        self._touchStarted = false;
        self._lastTouch = null;
    };

    /**
     * A duck punch of the $.ui.mouse _mouseInit method to support touch events.
     * This method extends the widget with bound touch event handlers that
     * translate touch events to mouse events and pass them to the widget's
     * original mouse event handling methods.
     */
    mouseProto._mouseInit = function () {

        var self = this;

        // Delegate the touch handlers to the widget's element
        self.element.bind({
            touchstart: $.proxy(self, '_touchStart'),
            touchmove: $.proxy(self, '_touchMove'),
            touchend: $.proxy(self, '_touchEnd')
        });

        // Call the original $.ui.mouse _mouseInit method
        _mouseInit.call(self);
    };

    /**
     * Remove the touch event handlers
     */
    mouseProto._mouseDestroy = function () {

        var self = this;

        // Delegate the touch handlers to the widget's element
        self.element.unbind({
            touchstart: $.proxy(self, '_touchStart'),
            touchmove: $.proxy(self, '_touchMove'),
            touchend: $.proxy(self, '_touchEnd')
        });

        // Call the original $.ui.mouse _mouseDestroy method
        _mouseDestroy.call(self);
    };

})(jQuery);