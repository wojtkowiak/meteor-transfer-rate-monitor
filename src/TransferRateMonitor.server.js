class TransferRateMonitor extends TransferRateMonitorCommon {

    constructor() {
        super();
        this.callbacks = [];
        this.options = {
            maxSubscriptions: 1,
            allowedUsers: null,
            password: 'giveMeStats'
        };
    }

    configure(options) {
        // TODO: validation
        _.extend(this.options, options);
    }

    getTransferRate() {
        return this.currentTransferRate;
    }

    calculateCurrentTransferRate() {
        this.calculateCurrentTransferRateCore();
        this.callbacks.forEach((callback) => callback());
    }

    setCallback(callback) {
        this.callbacks.push(callback);
    }

    replaceDirectStreamAccessSend() {
        const originalSend = Meteor.directStream.send;
        Meteor.directStream.send = (message, sessionId) => {
            this.bytesOut += message.length;
            originalSend.call(Meteor.directStream, message, sessionId);
        }
    }
}

transferRateMonitor = new TransferRateMonitor();

// TODO: implement authorization
Meteor.publish('transferServer', function() {
    let self = this;
    function send() {
        Meteor.directStream.send('transfer', self.connection.id);
    }

    this.onStop(() => {
        //transferRateMonitor.setCallback(send);
    });
    transferRateMonitor.setCallback(send);
});