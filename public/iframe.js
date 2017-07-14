/*!
 * Duplex Sandboxed Iframe Listener Library v1.0.0
 *
 * Copyright 2017
 *
 * Date: 2017-07-11 (July 11)
 */

((factory => {
    if (typeof define === 'function' && define.amd) {
        return define([], () => factory);
    }
    this.iframeListener = factory;
})(function(origin, hashGenerator) {

    var hashGenerator = hashGenerator || uuidv4;     // use default unique hash generator if not specified
    const namespace = hashGenerator(),               // create a hash for the namespace
        childnamespace = hashGenerator(),          // create a hash for the child namespace
        parentnamespace = hashGenerator(),         // create a hash for a parent namespace
        callbackListeners = {};                    // create a mapping for callback listeners

    // listener handler of parent
    window.addEventListener("message", event => {
        if (origin == null || event.origin == origin) {
            var cid = event.data.cid;
            var data = event.data.data;
            var event_name = event.data.event_name;
            if (event_name) { // recieving response from parent or child

                // hit the general listener
                window.dispatchEvent(new CustomEvent(namespace + event_name, {detail:event.data})); 

                if (event.data.name) { // came from child
                    // hit the general child listener
                    window.dispatchEvent(new CustomEvent(childnamespace + event_name, {detail:event.data}));
                    // hit the specific child listener
                    var iframe = document.querySelector("iframe[name='" + event.data.name + "']"); 
                    iframe.dispatchEvent(new CustomEvent(childnamespace + event_name, {detail:event.data}));
                } else {
                    // hit the general parent listener
                    window.dispatchEvent(new CustomEvent(parentnamespace + event_name, {detail:event.data})); 
                }
            } else {  // in response to sending data to parent or child
                var func = callbackListeners[cid];
                if (func) func(data);
            }
        }
    }, false);

    /**
    * 
    */
    this.createSandBoxedIframe = function(src, flags) {
        var iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.name = hashGenerator();
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
    this.postMessageToChild = function(iframes, event_name, data, cb) {
        iframes.forEach(function(iframe) {
            postMessage(iframe, event_name, data, cb, () => {});
        });
    };

    // set listener on self
    /**
    * 
    */
    this.setIframeListener = function(event_name, cb) {
        setListenerHelper(window, namespace, event_name, cb);
    };

    this.setParentIframeListener = function(event_name, cb) {
        setListenerHelper(window, parentnamespace, event_name, cb);
    };

    this.setChildrenIframeListener = function(iframes, event_name, cb) {
        iframes.forEach(function(iframe) {
            setListenerHelper(iframe, childnamespace, event_name, cb);
        });
    };

    this.setAnyChildIframeListener = function(event_name, cb) {
        setListenerHelper(window, childnamespace, event_name, cb);
    };

    function setListenerHelper(scope, namespace, event_name, cb) {
        scope.addEventListener(namespace + event_name, event => {
            var data = event.detail.data;
            var name = event.detail.name;
            var iframe = document.querySelector("iframe[name='" + name + "']");
            cb(data, iframe || parent, data => {
                var cid = event.detail.cid;
                var res = {data, cid};
                if (name) {  // if came from child
                    postHelper(iframe, res);
                } else {  // if came from parent
                    postHelper(parent, res);
                }
            });
        }, false); 
    }

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
            var cw = to.contentWindow;
            cw.postMessage(data, "*");
        }
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
}));