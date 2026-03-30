// Stub for @ungap/structured-clone (pure ESM, can't be required in Jest)
module.exports = globalThis.structuredClone ?? ((v) => JSON.parse(JSON.stringify(v)));
module.exports.default = module.exports;
