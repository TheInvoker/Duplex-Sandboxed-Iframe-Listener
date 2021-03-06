/*!
 * Duplex Sandboxed Iframe Listener (DSIL) Library v1.0.0
 *
 * Copyright 2017
 *
 * Date: 2017-08-12
 */

((factory => {
    if (typeof define === 'function' && define.amd) {
        return define([], () => factory);
    }
    this.DSIL = factory;
})(new function() {
	
	/**
	* This is a pretty cool unique hash generator function which came from these links:
	* https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
	* https://gist.github.com/jed/982883
	*/
	const uuidv4 = () => ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));

	/**
	* 
	*/
	this.createSandBoxedIframe = (src, flags) => {
		var iframe = document.createElement('iframe');
		iframe.src = src;
		iframe.name = uuidv4();
		iframe.sandbox = flags;
		return iframe;
	};

	/**
	* 
	*/
	this.setSandBoxedIframe = (iframe) => {
		iframe.name = uuidv4();
	};
	
	/**
	* 
	*/
	this.listener = function(origin) {

		const namespace = uuidv4(),               // create a hash for the namespace
			  childnamespace = uuidv4(),          // create a hash for the child namespace
			  parentnamespace = uuidv4(),         // create a hash for a parent namespace
			  callbackListeners = {};             // create a mapping for callback listeners

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

		var setListenerHelper = (scope, namespace, event_name, cb) => {
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
		};

		// send message to child or parent
		var postMessage = (to, event_name, data, cb, processor) => {
			var cid = uuidv4();
			callbackListeners[cid] = cb;
			var obj = {event_name, data, cid};
			processor(obj);
			postHelper(to, obj);
		};

		var postHelper = (to, data) => {
			if (to == parent) { // post to parent
				to.postMessage(data, "*");
			} else { // post to child which you need to wait for load
				var cw = to.contentWindow;
				cw.postMessage(data, "*");
			}
		};

		/**
		 *  Post to parent
		 */
		this.toParent = (event_name, data, cb) => {
			postMessage(parent, event_name, data, cb, obj => {
				obj.name = window.name;
			});
		};

		/**
		 *  Post to specified children
		 */
		this.toChild = (iframes, event_name, data, cb) => {
			if (iframes.constructor === Array) {
				iframes.forEach(iframe => {
					postMessage(iframe, event_name, data, cb, () => {});
				});
			} else {
				postMessage(iframes, event_name, data, cb, () => {});
			}
		};

		/**
		 *  Listen from parent or any child
		 */
		this.fromAny = (event_name, cb) => {
			setListenerHelper(window, namespace, event_name, cb);
		};

		/**
		 *  Listen from only parent
		 */
		this.fromParent = (event_name, cb) => {
			setListenerHelper(window, parentnamespace, event_name, cb);
		};
		
		/**
		 *  Listen from only specified children
		 */
		this.fromChild = (iframes, event_name, cb) => {
			if (iframes.constructor === Array) {
				iframes.forEach(iframe => {
					setListenerHelper(iframe, childnamespace, event_name, cb);
				});
			} else {
				setListenerHelper(iframes, childnamespace, event_name, cb);
			}
		};
		
		/**
		 *  Listen from any child
		 */
		this.fromAnyChild = (event_name, cb) => {
			setListenerHelper(window, childnamespace, event_name, cb);
		};
	};
}));