const bufferLength = 16;

/**
 * This is a simple binary protocol for sending information about server's transfer rate.
 * Binary format is chosen to lower the impact on bandwidth.
 *
 * @category PROTOCOL
 * @type {TransferRateProtocol}
 */
TransferRateProtocol = class TransferRateProtocol extends CustomProtocol {

    constructor() {
        super();
        this.SERVER_TRANSFER_RATE_MESSAGE = 1;
        this.registerProtocol('TransferRateProtocol');
        this.registerMessage(this.SERVER_TRANSFER_RATE_MESSAGE);

        if (Meteor.isClient) {
            this._arrayBuffer = new ArrayBuffer(bufferLength);
        } else {
            this._buffer = new Buffer(bufferLength);
        }
    }

    /**
     * Simple binary encoder. It just packs 4 32bit integers to a binary string.
     *
     * @param {int} messageId Message id.
     * @param {Array} payload Values to encode in an array.
     * @returns {string} Encoded message.
     */
    encode(messageId, definition, ...payload) {
        let message = '';
        let offset = 0;
        this._buffer.fill(0);
        for (const data of payload) {
            // Write the values as 32bit low endian integers.
            this._buffer.writeInt32LE(data, offset);
            offset += 4;
        }
        // TODO: check why Buffer.toString('binary') does not work.
        for (let i = 0; i < bufferLength; i++) {
            // Save every byte as a string character. SockJS does not support byte buffers.
            message += String.fromCharCode(this._buffer.readInt8(i));
        }
        return message;
    }

    /**
     * Simple binary decoder. Reads 4 32bit integers from binary string.
     *
     * @param {int} messageId Message id.
     * @param {string} message Raw message in a string.
     * @returns {Array.<int>} Decoded values.
     */
    decode(messageId, definition, message) {
        // TODO: TextDecoder might be used but it may not be worthy if we need to polyfill it.
        this._arrayBuffer = new ArrayBuffer(16); // Clear the buffer.
        const bufferView = new Uint8Array(this._arrayBuffer);
        for (let i = 0; i < message.length; i++) {
            // Save every character from the string as a 8bit integer.
            bufferView[i] = message.charCodeAt(i);
        }
        // Now we will view the ArrayBuffer as an 32bit integers array and get a standard js
        // array from it.
        return Array.prototype.slice.call(new Uint32Array(this._arrayBuffer));
    }
};
