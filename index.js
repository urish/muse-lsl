require('./text-polyfill');

const { MUSE_SERVICE, MuseClient } = require('muse-js');
const noble = require('noble');
const bleat = require('bleat').webbluetooth;
const lsl = require('./lsl');
const { Observable } = require('rxjs');

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
    console.log('Connected!');
    return client;
}

function streamLsl(client) {
    console.log('LSL: Creating Stream...');

    const deviceName = client.gatt.device.name;
    const info = lsl.create_streaminfo("Muse", "EEG", 5, 256, lsl.LSLTypes.cft_float32, deviceName);
    const desc = lsl.get_desc(info);
    lsl.append_child_value(desc, "manufacturer", "Interaxon");
    const channels = lsl.append_child(desc, "channels");
    for (let i = 0; i < 5; i++) {
        let channel = lsl.append_child(channels, "channel");
        lsl.append_child_value(channel, "label", `chan${i}`);
        lsl.append_child_value(channel, "unit", "microvolts");
        lsl.append_child_value(channel, "type", "EEG");
    }

    const outlet = lsl.create_outlet(info, 0, 360);
    let sampleCounter = 0;

    Observable.from(client.eegReadings)
        .bufferCount(5)
        .mergeMap(electrodes =>
            electrodes.reduce((samples, electrode) =>
                samples.map((sample, index) => ({
                    timestamp: electrode.timestamp,
                    channelData: [...sample.channelData, electrode.samples[index]]
                })),
                electrodes[0].samples.map(() => ({ channelData: [] })))
        )
        .finally(() => lsl.lsl_destroy_outlet(outlet))
        .subscribe(values => {
            const sample = new lsl.FloatArray(values.channelData);
            lsl.push_sample_f(outlet, sample);

            sampleCounter++;
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`LSL: Sent ${sampleCounter} samples`);;
        })
}

noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
        connect().then(streamLsl);
    }
});
