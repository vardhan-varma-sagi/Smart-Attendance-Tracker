const tls = require('tls');
const fs = require('fs');

const host = 'ac-eiqorfe-shard-00-00.ctjcaw0.mongodb.net';
const port = 27017;
const logFile = 'tls_test.log';

fs.writeFileSync(logFile, `Testing TLS connection to ${host}:${port}...\n`);

const socket = tls.connect(port, host, {
    servername: host // Important for SNI
}, () => {
    fs.appendFileSync(logFile, '✓ TLS Connection ESTABLISHED successfully.\n');
    fs.appendFileSync(logFile, `authorized: ${socket.authorized}\n`);
    if (!socket.authorized) {
        fs.appendFileSync(logFile, `authorizationError: ${socket.authorizationError}\n`);
    } else {
        const cert = socket.getPeerCertificate();
        fs.appendFileSync(logFile, `Certificate Valid From: ${cert.valid_from}\n`);
        fs.appendFileSync(logFile, `Certificate Valid To: ${cert.valid_to}\n`);
    }
    socket.destroy();
    process.exit(0);
});

socket.on('error', (err) => {
    fs.appendFileSync(logFile, `✗ TLS Connection ERROR: ${err.message}\n`);
    process.exit(1);
});
