TransferRateMonitorCommon = class TransferRateMonitorCommon {

    constructor() {
        this.bytesIn = 0;
        this.bytesOut = 0;
        this.messagesIn = 0;
        this.messagesOut = 0;

        this.currentTransferRate = {
            rateIn: 0,
            rateOut: 0,
            messagesIn: 0,
            messagesOut: 0
        };
        this._installOutcomingHook();
        Meteor.directStream.onMessage(this.messageHandler.bind(this));
        this.lastTimestamp = Date.now();
        this.mainInterval = Meteor.setInterval(this.calculateCurrentTransferRate.bind(this), 1000);
    }

    _installOutcomingHook() {
        const originalDDPCommonStringifyDDP = DDPCommon.stringifyDDP;
        const self = this;
        DDPCommon.stringifyDDP = function stringifyDDP(msg) {
            const message = originalDDPCommonStringifyDDP(msg);
            self.bytesOut += message.length;
            return message;
        };

        if (Package['omega:direct-stream-access']) {
            this.replaceDirectStreamAccessSend();

        }
    }

    messageHandler(message) {
        this.bytesIn += message.length;
        this.messagesIn++;
    }


    calculateCurrentTransferRateCore() {
        const now = Date.now();
        const timeSpan = now - this.lastTimestamp;
        this.lastTimestamp = now;
        const measurementUnit = timeSpan / 1000;
        this.currentTransferRate = {
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
