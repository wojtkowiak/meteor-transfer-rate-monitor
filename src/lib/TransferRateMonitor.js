/**
 * Some common logic for server and client.
 *
 * @type {TransferRateMonitorCommon}
 */
TransferRateMonitorCommon = class TransferRateMonitorCommon {

    constructor() {
        this.bytesIn = 0;
        this.bytesOut = 0;
        this.messagesIn = 0;
        this.messagesOut = 0;

        this._currentTransferRate = {
            rateIn: 0,
            rateOut: 0,
            messagesIn: 0,
            messagesOut: 0
        };
        this._installOutcomingHook();
        Meteor.directStream.onMessage(this._messageHandler.bind(this));
        this.lastTimestamp = Date.now();
        this._mainInterval = Meteor.setInterval(
            this._calculateCurrentTransferRate.bind(this),
            1000
        );
    }

    /**
     * Install some hooks to get info about sent bytes.
     *
     * @private
     */
    _installOutcomingHook() {
        const originalDDPCommonStringifyDDP = DDPCommon.stringifyDDP;
        const self = this;
        // Wrap sringifyDDP to calculate what Meteor is sending.
        DDPCommon.stringifyDDP = function stringifyDDP(msg) {
            const message = originalDDPCommonStringifyDDP(msg);
            self.bytesOut += message.length;
            return message;
        };
        // Wrap direct stream send to calculate custom protocols.
        this._replaceDirectStreamAccessSend();
    }

    /**
     * Add all incoming bytes.
     *
     * @param message
     * @private
     */
    _messageHandler(message) {
        this.bytesIn += message.length;
        this.messagesIn++;
    }


    /**
     * Do the average calculation for 1 second.
     *
     * @private
     */
    _calculateCurrentTransferRateCore() {
        const now = Date.now();
        const timeSpan = now - this.lastTimestamp;
        this.lastTimestamp = now;
        const measurementUnit = timeSpan / 1000;
        this._currentTransferRate = {
            rateIn: Math.round(this.bytesIn / measurementUnit),
            rateOut: Math.round(this.bytesOut / measurementUnit),
            messagesIn: Math.round(this.messagesIn / measurementUnit),
            messagesOut: Math.round(this.messagesOut / measurementUnit)
        };
        this.bytesIn = 0;
        this.bytesOut = 0;
        this.messagesIn = 0;
        this.messagesOut = 0;
    }
}
