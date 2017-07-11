/*!
 * Duplex Sandboxed Iframe Listener Library v1.0.0
 *
 * Copyright 2017
 *
 * Date: 2017-07-11 (July 11)
 */
class iframeListener {

    constructor(hashGenerator) {

        var hashGenerator = hashGenerator || uuidv4,   // use default unique hash generator if not specified
            namespace = hashGenerator(),               // create a hash for the namespace
            iframeLoadListenerHash = hashGenerator(),  // create a hash for the iframe load event
            callbackListeners = {},                    // create a mapping for callback listeners
            iframeLoadStates = {};                     // create a mapping for iframe load states

        // listener handler of parent
        window.addEventListener("message", event => {
            var cid = event.data.cid;
            var data = event.data.data;
            var event_name = event.data.event_name;

            if (event_name) { // recieving response from parent or child
                window.dispatchEvent(new CustomEvent(namespace + event_name, {detail:event.data}));
            } else {  // in response to sending data to parent or child
                var func = callbackListeners[cid];
                if (func) func(data);
            }
        }, false);

        // listen for iframe load events
        window.addEventListener(iframeLoadListenerHash, function (e) {
            var iframe = e.detail;
            var context = getContext(iframe);
            runQueue(context.iframe, context.queue);
            context.loaded = true;
        }, false);

        /**
         * 
         */
        this.getSandBoxedIframe = function(src, flags) {
            var iframe = document.createElement('iframe');
            iframe.src = src;
            iframe.name = hashGenerator();
            iframe.onload = () => {window.dispatchEvent(new CustomEvent(iframeLoadListenerHash, {detail:iframe}))};
            iframe.sandbox = flags;
            return iframe;
        };

        /**
         * 
         */
        this.postMessageToParent = function(event_name, data, cb) {
            postMessage(parent, event_name, data, cb, obj => {
                obj.name = window.name;
            });
        };

        /**
         * 
         */
        this.postMessageToChild = function(iframe, event_name, data, cb) {
            postMessage(iframe, event_name, data, cb, () => {});
        };

        // set listener on self
        /**
         * 
         */
        this.setIframeListener = function(event_name, cb) {
            window.addEventListener(namespace + event_name, event => {
                var data = event.detail.data;
                cb(data, data => {
                    var name = event.detail.name;
                    var cid = event.detail.cid;
                    var res = {data, cid};
                    if (name) {  // if came from child
                        postHelper(document.querySelector("iframe[name='" + name + "']"), res);
                    } else {  // if came from parent
                        postHelper(parent, res);
                    }
                });
            }, false);
        };

        // send message to child or parent
        function postMessage(to, event_name, data, cb, processor) {
            var cid = hashGenerator();
            callbackListeners[cid] = cb;
            var obj = {event_name, data, cid};
            processor(obj);
            postHelper(to, obj);
        };

        function postHelper(to, data) {
            if (to == parent) { // post to parent
                to.postMessage(data, "*");
            } else { // post to child which you need to wait for load
                var context = getContext(to);
                context.queue.push(data);
                if (context.loaded) {
                    runQueue(context.iframe, context.queue);
                }
            }
        }

        function getContext(iframe) {
            var context = iframeLoadStates[iframe.name];
            if (!context) {
                context = {queue : [], loaded : false, iframe};
                iframeLoadStates[iframe.name] = context;
            }
            return context;
        }

        function runQueue(iframe, queue) {
            var cw = iframe.contentWindow;
            queue.forEach(function(element) {
                cw.postMessage(element, "*");
            }, this);
            queue.length = 0;
        }

        /**
         * This is a pretty cool unique hash generator function which came from these links:
         * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
         * https://gist.github.com/jed/982883
         */
        function uuidv4() {
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }
    }
}