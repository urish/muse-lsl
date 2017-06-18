const ffi = require('ffi');
const ref = require('ref');
const ArrayType = require('ref-array');

const streamInfo = ref.refType(ref.types.void);
const xmlPtr = ref.refType(ref.types.void);
const outletType = ref.refType(ref.types.void);
const FloatArray = ArrayType(ref.types.float);

const LSLTypes = {
    cft_undefined: 0,
    cft_float32: 1,
    cft_double64: 2,
    cft_string: 3,
    cft_int32: 4,
    cft_int16: 5,
    cft_int8: 6,
    cft_int64: 7,
}

const lsl = ffi.Library('liblsl64', {
    'lsl_create_streaminfo': [streamInfo, ['string', 'string', 'int', 'double', 'int', 'string']],
    'lsl_get_desc': [xmlPtr, [streamInfo]],
    'lsl_append_child_value': ['void', [xmlPtr, 'string', 'string']],
    'lsl_append_child': [xmlPtr, [xmlPtr, 'string']],
    'lsl_create_outlet': [outletType, [streamInfo, 'int', 'int']],
    'lsl_push_sample_f': ['void', [outletType, FloatArray]],
    'lsl_push_sample_ft': ['void', [outletType, FloatArray, 'double']],
    'lsl_destroy_outlet': ['void', [outletType]],
});

module.exports = {
    LSLTypes,
    FloatArray,
    create_streaminfo: lsl.lsl_create_streaminfo,
    get_desc: lsl.lsl_get_desc,
    append_child_value: lsl.lsl_append_child_value,
    append_child: lsl.lsl_append_child,
    create_outlet: lsl.lsl_create_outlet,
    push_sample_f: lsl.lsl_push_sample_f,
    push_sample_ft: lsl.lsl_push_sample_ft,
    destroy_outlet: lsl.lsl_destroy_outlet,
};
