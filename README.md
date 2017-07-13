# Duplex-Sandboxed-Iframe-Listener (DSIL)
### pronounced like 'diesel'
A fully native es6 javascript library to handle duplex asynchronous communications between parent and child sandboxed iframes.

## How to run demo:

First clone and cd into the root folder

```
npm install express
node server
```

Open http://localhost:3000/A.html

You will then get 8 alert messages. A.html has an iframe that loads B.html and B.html has an iframe that loads C.html. The black arrows indicates sending a message to the event name. The red arrows represent the callbacks. Data must be serializable to send, so naturally you can send JSON objects too. 

![alt text](https://raw.githubusercontent.com/TheInvoker/Duplex-Sandboxed-Iframe-Listener/master/DISL.png)

## Actual API

Create a listener:
```
var ifl = new iframeListener(); // has 2 optional parameters, first is origin, and second is a function that takes 0 parameters and returns a unique hash
```

Listen for events from parent or child:
```
ifl.setIframeListener("myevent", (data, parentoriframe, cb) => { 
	alert(data);
	cb("myevent_callback");  // callback that accepts 1 paramater which is your data you want to send back
});
```

Listen for events from the parent:
```
ifl.setParentIframeListener("myevent", (data, parent, cb) => { 
	alert(data);
	cb("myevent_callback"); 
});
```

Listen for events from specified children:
```
ifl.setChildrenIframeListener(iframes, "myevent", (data, iframe, cb) => {   // iframes is an array of iframes
	alert(data);
	cb("myevent_callback"); 
});
```

Listen for events from any children:
```
ifl.setAnyChildIframeListener("myevent", (data, iframe, cb) => {   // iframes is an array of iframes
	alert(data);
	cb("myevent_callback"); 
});
```

Create an iframe that can post and listen, and add to DOM:
```
var ifr = ifl.getSandBoxedIframe("childpage.html", "allow-forms allow-modals allow-scripts allow-popups"); // params are source and sandbox flags
document.body.appendChild(ifr); // ifr is a normal iframe DOM element
```

Send data to child:
```
ifl.postMessageToChild(ifr, "myevent_forchild", "some data", data => { // only sends once its load event runs which only happens when you add it to the DOM
	alert(data);
});
```

Send data to parent:
```
ifl.postMessageToParent("myevent_forparent", "some data", data => {
	alert(data);
});
```

Note that, when a child talks sends a message to the parent, it should be fine, but a parent must wait until the child has set up the listener before sending a message for that listener. You can set it up like in the demo so that the child first sets up its listeners, then sends a message to the parent indicating it is ready. The parent then starts sending messages to the child. This guarantees listeners will be ready.

Tested only on Google Chrome Version 60.0.3112.50 (Official Build) beta (64-bit).