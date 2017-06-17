require('./text-polyfill');

const { MUSE_SERVICE, MuseClient } = require('muse-js');
const noble = require('noble');
const bleat = require('bleat').webbluetooth;

async function connect() {
    let device = await bleat.requestDevice({
        filters: [{ name: 'Muse-1324' }],
        optionalServices: [MUSE_SERVICE]
    });
    const gatt = await device.gatt.connect();
    console.log('Device name:', gatt.device.name);

    const client = new MuseClient();
    await client.connect(gatt);
    client.controlResponses.subscribe(x => console.log('Response:', x));
    await client.start();
    return client;
}

noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
        connect();
    }
});
