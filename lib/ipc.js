// Copyright (c) 2012 Agora SA
// Modified By: Kuba Niegowski
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

"use strict";

var net = require('net'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;


exports.listen = function(socketPath, callback) {
    
    net.createServer(function(socket) {

        var ipc = new IPC(socket);
        callback && callback(ipc);
        
    }.bind(this)).listen(socketPath);
};

exports.connect = function(socketPath) {
    return new IPC().connect(socketPath);
};

exports.genSockName = function(name) {
    return '/tmp/node-ipc-' + name.replace(/[^\w]+/g, '-');
};


var IPC = exports.IPC = function(socket) {

    this._socket = null;
    this._data = '';

    if (socket) this._setSocket(socket);
};

util.inherits(IPC, EventEmitter);


IPC.prototype.listen = function(socketPath) {
    throw new Error('IPC.listen is depreciated! Use exports.listen');
};

IPC.prototype.connect = function(socketPath) {
    if (this._socket)
        throw new Error('Already connected or listening!');
    
    this._setSocket(net.connect(socketPath));
    
    return this;
};

IPC.prototype.send = function(message) { 
    if (!this._socket)
        throw new Error('Connect or start listening before sending messages!');
    
    var args = Array.prototype.slice.call(arguments, 0);
    this._socket.write(JSON.stringify(args) + '\n');
    
};

IPC.prototype._setSocket = function(socket) {
    
    this._socket = socket;
    this._socket.setEncoding('ascii');
    
    this._socket.on('data', this._onData.bind(this));
    this._socket.on('end', this.emit.bind(this, 'end'));
    this._socket.on('error', this.emit.bind(this, 'error'));
    this._socket.on('timeout', this.emit.bind(this, 'timeout'));
    
    this.emit('connect');
};

IPC.prototype._onData = function(data) {
    
    this._data += data;
    var i, start = 0;

    while ((i = this._data.indexOf('\n', start)) >= 0) {
        var json = this._data.slice(start, i);
        var message = JSON.parse(json);
        
        if (!Array.isArray(message))
            throw new Error('Malformed IPC message received!');
            
        message.unshift('message');
        this.emit.apply(this, message);
    
        start = i + 1;
    }
    
    this._data = this._data.slice(start);
    
};
