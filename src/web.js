/**
 * Created by qiaofu on 14-6-27.
 * domReady From KISSY
 */
(function(Leaf) {
    var win = typeof window !== 'undefined' ? window : {},
        undef,
        doc = win.document || {},
        docElem = doc.documentElement,
        EMPTY = '',
        domReady = 0,
        callbacks = [],
        // The number of poll times.
        POLL_RETIRES = 500,
        // The poll interval in milliseconds.
        POLL_INTERVAL = 40,
        // #id or id
        RE_ID_STR = /^#?([\w-]+)$/,
        RE_NOT_WHITESPACE = /\S/,
        standardEventModel = doc.addEventListener,
        supportEvent = doc.attachEvent || standardEventModel,
        DOM_READY_EVENT = 'DOMContentLoaded',
        READY_STATE_CHANGE_EVENT = 'readystatechange',
        LOAD_EVENT = 'load',
        COMPLETE = 'complete',
        /*global addEventListener:true, removeEventListener:true*/
        addEventListener = standardEventModel ? function (el, type, fn) {
            el.addEventListener(type, fn, false);
        } : function (el, type, fn) {
            el.attachEvent('on' + type, fn);
        },
        removeEventListener = standardEventModel ? function (el, type, fn) {
            el.removeEventListener(type, fn, false);
        } : function (el, type, fn) {
            el.detachEvent('on' + type, fn);
        };

    var Web = {
        /**
         * Specify a function to execute when the Dom is fully loaded.
         * @param fn {Function} A function to execute after the Dom is ready
         * @chainable
         */
        ready: function (fn) {
            if (domReady) {
                try {
                    fn();
                } catch (e) {
                    setTimeout(function () {
                        throw e;
                    }, 0);
                }
            } else {
                callbacks.push(fn);
            }
            return this;
        }
    };

    function fireReady() {
        if (domReady) {
            return;
        }
        // nodejs
        if (win && win.setTimeout) {
            removeEventListener(win, LOAD_EVENT, fireReady);
        }
        domReady = 1;
        for (var i = 0; i < callbacks.length; i++) {
            try {
                callbacks[i]();
            } catch (e) {
                /*jshint loopfunc:true*/
                setTimeout(function () {
                    throw e;
                }, 0);
            }
        }
    }

//  Binds ready events.
    function bindReady() {
        // Catch cases where ready() is called after the
        // browser event has already occurred.
        if (!doc || doc.readyState === COMPLETE) {
            fireReady();
            return;
        }

        // A fallback to window.onload, that will always work
        addEventListener(win, LOAD_EVENT, fireReady);

        // w3c mode
        if (standardEventModel) {
            var domReady = function () {
                removeEventListener(doc, DOM_READY_EVENT, domReady);
                fireReady();
            };

            addEventListener(doc, DOM_READY_EVENT, domReady);
        } else {
            var stateChange = function () {
                if (doc.readyState === COMPLETE) {
                    removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
                    fireReady();
                }
            };

            // ensure firing before onload (but completed after all inner iframes is loaded)
            // maybe late but safe also for iframes
            addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);

            // If IE and not a frame
            // continually check to see if the document is ready
            var notframe,
                doScroll = docElem && docElem.doScroll;

            try {
                notframe = (win.frameElement === null);
            } catch (e) {
                notframe = false;
            }

            // can not use in iframe,parent window is dom ready so doScroll is ready too
            if (doScroll && notframe) {
                var readyScroll = function () {
                    try {
                        // Ref: http://javascript.nwbox.com/IEContentLoaded/
                        doScroll('left');
                        fireReady();
                    } catch (ex) {
                        setTimeout(readyScroll, POLL_INTERVAL);
                    }
                };
                readyScroll();
            }
        }
    }

// bind on start
// in case when you bind but the DOMContentLoaded has triggered
// then you has to wait onload
// worst case no callback at all
    if (supportEvent) {
        bindReady();
    }

    try {
        doc.execCommand('BackgroundImageCache', false, true);
    } catch (e) {
    }

    Leaf.ready = Web.ready;

}(Leaf));

