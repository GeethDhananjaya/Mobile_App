const os = require('os');
const networkInterfaces = os.networkInterfaces();
for (const interfaceName in networkInterfaces) {
    const addresses = networkInterfaces[interfaceName];
    for (const addr of addresses) {
        if (addr.family === 'IPv4' && !addr.internal) {
            console.log(addr.address);
        }
    }
}
