
var ipc = require('ipc-rpc');

ipc.listen(ipc.genSockName('test'), function(channel) {

    console.log('client connected');
    
    channel
        .send('hello')
        .on('message', function(msg) { 
            console.log('received:', msg);
        })
        .on('close', function() {
            console.log('client close');
        })
        .on('end', function() {
            console.log('client end');
        });
});

