# Duplex-Sandboxed-Iframe-Listener (DSIL)
### [diesel]
A fully native es6 javascript library (require.js compatible) to handle duplex asynchronous communications between parent and child sandboxed iframes.

## How to run demo:

First clone and cd into the root folder

```
npm install express
node server
```

Open http://localhost:3000/A.html

You will then get 8 alert messages. A.html has an iframe that loads B.html and B.html has an iframe that loads C.html. The black arrows indicates sending a message to the event name. The red arrows represent the callbacks. Data must be serializable to send, so naturally you can send JSON objects too. 

![alt text](https://raw.githubusercontent.com/TheInvoker/Duplex-Sandboxed-Iframe-Listener/master/DISL.png)

## API

Create a DSIL iframe (iframe DOM element):
```
// params are source and sandbox flags (update the flags as you see fit)
var ifr = DSIL.getSandBoxedIframe("childpage.html", "allow-forms allow-modals allow-scripts allow-popups"); 
```

Create a DSIL iframe (iframe DOM element) using an existing iframe:
```
// params are source and sandbox flags
DSIL.setSandBoxedIframe(document.querySelector("#myIframe")); 
```

Create a communications object:
```
var ifl = new DSIL.listener(); // has 1 optional parameter for origin
```

Listen for events from the parent or any child:
```
ifl.fromAny("myevent", (data, parentoriframe, cb) => { 
	alert(data);
	cb("myevent_callback");  // callback that accepts 1 paramater which is your data you want to send back
});
```

Listen for events from the parent:
```
ifl.fromParent("myevent", (data, parent, cb) => { 
	alert(data);
	cb("myevent_callback"); 
});
```

Listen for events from specified children:
```
// iframes is a DSIL iframe or an array of DSIL iframes
ifl.fromChild(iframes, "myevent", (data, iframe, cb) => {   
	alert(data);
	cb("myevent_callback"); 
});
```

Listen for events from any children:
```
// iframes is an array of iframes
ifl.fromAnyChild("myevent", (data, iframe, cb) => {   
	alert(data);
	cb("myevent_callback"); 
});
```

Send data to child:
```
// only sends once its load event triggers after adding to the DOM
// iframes is a DSIL iframe or an array of DSIL iframes
ifl.toChild(iframes, "myevent_forchild", "some data", data => { 
	alert(data);
});
```

Send data to parent:
```
ifl.toParent("myevent_forparent", "some data", data => {
	alert(data);
});
```

Note that, when a child talks sends a message to the parent, it should be fine, but a parent must wait until the child has set up the listener before sending a message for that listener. You can set it up like in the demo so that the child first sets up its listeners, then sends a message to the parent indicating it is ready. The parent then starts sending messages to the child. This guarantees listeners will be ready.

Tested only on Google Chrome Version 60.0.3112.50 (Official Build) beta (64-bit).