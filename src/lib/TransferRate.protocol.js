TransferRateProtocol = class TransferRateProtocol extends CustomProtocol {

    constructor() {
        super();
        this.SERVER_TRANSFER_RATE = 1;
        this.registerMessage(this.SERVER_TRANSFER_RATE);
    }

    encode(messageId, ...payload) {
        let message = '';
        for (let data of payload) {
            message += data.toString(32);
        }
        return JSON.stringify(message);
    }

    decode(messageId, message) {
        var reader = new FileReader();
        reader.addEventListener("loadend", function() {
            // reader.result contains the contents of blob as a typed array
        });
        reader.readAsArrayBuffer(blob);
    }

};