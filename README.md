# Duplex-Sandboxed-Iframe-Listener
A library to handle duplex asynchronous communications between parent and child sandboxed iframes. Does not use jquery, it is fully native es6 javascript.

How to run
npm install express
node server

This starts the server at http://localhost:3000/A.html. Just visit the link. You will then get 8 alert messages:

![alt text](https://raw.githubusercontent.com/TheInvoker/Duplex-Sandboxed-Iframe-Listener/master/public/DISL.png)

The black arrows indicates sending a message to the event name. The red arrows represent the callbacks. All data must be serializable. 