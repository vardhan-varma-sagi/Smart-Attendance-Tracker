const tls = require('tls');
const fs = require('fs');

const host = 'ac-eiqorfe-shard-00-00.ctjcaw0.mongodb.net';
const port = 27017;
const logFile = 'tls_test_insecure.log';

fs.writeFileSync(logFile, `Testing TLS connection to ${host}:${port} (rejectUnauthorized: false)...\n`);

const socket = tls.connect(port, host, {
    servername: host,
    rejectUnauthorized: false
}, () => {
    fs.appendFileSync(logFile, '✓ TLS Connection ESTABLISHED successfully (Insecure).\n');
    const cert = socket.getPeerCertificate();
    if (cert) {
        fs.appendFileSync(logFile, `Certificate Subject: ${cert.subject.CN}\n`);
        fs.appendFileSync(logFile, `Certificate Valid From: ${cert.valid_from}\n`);
        fs.appendFileSync(logFile, `Certificate Valid To: ${cert.valid_to}\n`);
    } else {
        fs.appendFileSync(logFile, `No certificate received.\n`);
    }
    socket.destroy();
    process.exit(0);
});

socket.on('error', (err) => {
    fs.appendFileSync(logFile, `✗ TLS Connection ERROR: ${err.message}\n`);
    process.exit(1);
});
