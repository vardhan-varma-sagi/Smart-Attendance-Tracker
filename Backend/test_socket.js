const net = require('net');
const fs = require('fs');

const host = 'ac-eiqorfe-shard-00-00.ctjcaw0.mongodb.net';
const port = 27017;
const logFile = 'socket_test.log';

fs.writeFileSync(logFile, `Testing TCP connection to ${host}:${port}...\n`);

const socket = new net.Socket();
socket.setTimeout(5000);

socket.on('connect', () => {
    fs.appendFileSync(logFile, '✓ TCP Connection ESTABLISHED successfully.\n');
    socket.destroy();
    process.exit(0);
});

socket.on('timeout', () => {
    fs.appendFileSync(logFile, '✗ Connection TIMED OUT.\n');
    socket.destroy();
    process.exit(1);
});

socket.on('error', (err) => {
    fs.appendFileSync(logFile, `✗ Connection ERROR: ${err.message}\n`);
    process.exit(1);
});

socket.connect(port, host);
