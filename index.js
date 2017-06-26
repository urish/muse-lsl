require('./text-polyfill');

const { MUSE_SERVICE, MuseClient, zipSamples, channelNames } = require('muse-js');
const noble = require('noble');
const bleat = require('bleat').webbluetooth;
const lsl = require('node-lsl');
const { Observable } = require('rxjs');

async function connect() {
    let device = await bleat.requestDevice({
        filters: [{ services: [MUSE_SERVICE] }]
    });
    const gatt = await device.gatt.connect();
    console.log('Device name:', gatt.device.name);

    const client = new MuseClient();
    await client.connect(gatt);
    client.controlResponses.subscribe(x => console.log('Response:', x));
    await client.start();
    console.log('Connected!');
    return client;
}

function streamLsl(client) {
    console.log('LSL: Creating Stream...');

    // These packets keep the connection alive
    const keepaliveTimer = setInterval(() => client.sendCommand(''), 3000);

    const info = lsl.create_streaminfo("Muse", "EEG", 5, 256, lsl.channel_format_t.cft_float32, client.deviceName);
    const desc = lsl.get_desc(info);
    lsl.append_child_value(desc, "manufacturer", "Interaxon");
    const channels = lsl.append_child(desc, "channels");
    for (let i = 0; i < 5; i++) {
        const channel = lsl.append_child(channels, "channel");
        lsl.append_child_value(channel, "label", channelNames[i]);
        lsl.append_child_value(channel, "unit", "microvolts");
        lsl.append_child_value(channel, "type", "EEG");
    }

    const outlet = lsl.create_outlet(info, 0, 360);
    let sampleCounter = 0;

    Observable.from(zipSamples(client.eegReadings))
        .finally(() => {
            lsl.lsl_destroy_outlet(outlet);
            clearInterval(keepaliveTimer);
        })
        .subscribe(sample => {
            const sampleData = new lsl.FloatArray(sample.data);
            lsl.push_sample_ft(outlet, sampleData, lsl.local_clock());
            sampleCounter++;
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`LSL: Sent ${sampleCounter} samples`);;
        });
}

noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
        connect().then(streamLsl);
    }
});
