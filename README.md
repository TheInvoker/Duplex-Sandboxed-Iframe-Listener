# Duplex-Sandboxed-Iframe-Listener
A library to handle duplex asynchronous communications between parent and child sandboxed iframes. Does not use jquery, it is fully native es6 javascript.

How to run:

```
npm install express
node server
```

Open http://localhost:3000/A.html

You will then get 8 alert messages. The black arrows indicates sending a message to the event name. The red arrows represent the callbacks. Data must be serializable to send, so naturally you can send JSON objects too. 

![alt text](https://raw.githubusercontent.com/TheInvoker/Duplex-Sandboxed-Iframe-Listener/master/DISL.png)

Actual API

Create a listener:
```
var ifl = new iframeListener();
```

Listen on an event:
```
ifl.setIframeListener("myevent", (data, cb) => {
	alert(data);
	cb("myevent_callback");
});
```

Send data to parent:
```
ifl.postMessageToParent("myevent_forparent", "some data", data => {
	alert(data);
});
```

Create an iframe that can post and listen:
```
var ifr = ifl.getSandBoxedIframe("childpage.html", "allow-forms allow-modals allow-scripts allow-popups");
document.body.appendChild(ifr);
```

Send data to child:
```
ifl.postMessageToChild(ifr, "myevent_forchild", "some data", data => {
	alert(data);
});
```