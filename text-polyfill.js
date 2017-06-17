if (typeof TextEncoder === 'undefined' && typeof TextDecoder === 'undefined') {
    const encoding = require('text-encoding'); // polyfill
    global.TextEncoder = encoding.TextEncoder;
    global.TextDecoder = encoding.TextDecoder;
}
