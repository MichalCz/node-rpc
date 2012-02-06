
var ipc = require('ipc-rpc');
   
var channel = ipc.connect(ipc.genSockName('test'));
channel
    .send('knock-knock')
    .on('message', function(msg) {
        console.log('received message:', msg);
    })
    .on('close', function() {
        console.log('close');
    })
    .on('end', function() {
        console.log('end');
    });

