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
var ifl = new iframeListener(); // has 1 optional parameter which is a function that takes 0 parameters and returns a unique hash
```

Listen for events:
```
ifl.setIframeListener("myevent", (data, cb) => {
	alert(data);
	cb("myevent_callback");  // callback that accepts 1 paramater which is your data you want to send back
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

Tested only on Google Chrome Version 60.0.3112.50 (Official Build) beta (64-bit).