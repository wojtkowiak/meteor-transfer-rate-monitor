class TransferRateMonitor extends TransferRateMonitorCommon {

    constructor() {
        super();
        this.callbacks = [];
        this.options = {
            maxSubscriptions: 1,
            allowedUsers: null,
            password: 'giveMeStats'
        };
        this.protocol = new JsonProtocol();

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
        _.each(this.callbacks, id => this.protocol.send('data', this.currentTransferRate, id));
    }

    register(id) {
        if (this.callbacks.length < this.options.maxSubscriptions) {
            this.callbacks.push(id);
        } else {
            throw new Error('Too many subscriptions.');
        }
    }

    unregister(id) {
        if (~this.callbacks.indexOf(id)) {
            this.callbacks.splice(this.callbacks.indexOf(id), 1);
        }
    }

    replaceDirectStreamAccessSend() {
        const originalSend = Meteor.directStream.send;
        Meteor.directStream.send = (message, sessionId) => {
            this.bytesOut += message.length;
            originalSend.call(Meteor.directStream, message, sessionId);
        }
    }

    isAuthorized(password, userId) {
        if (!this.options.password === password) return false;
        if (this.options.allowedUsers === null) return true;
        return ~this.options.allowedUsers.indexOf(userId);
    }
}

transferRateMonitor = new TransferRateMonitor();

Meteor.publish('transferServer', function(password) {
    let self = this;

    if (!transferRateMonitor.isAuthorized(password, this.userId)) {
        console.log('unathorized');
        this.stop();
        return;
    }

    this.onStop(() => {
        transferRateMonitor.unregister(self.connection.id);
        console.log('stop for ' + self.connection.id + ' count: ' + transferRateMonitor.callbacks.length);
    });

    try {
        transferRateMonitor.register(self.connection.id);
        console.log('registered ' + self.connection.id + ' count: ' + transferRateMonitor.callbacks.length);
    } catch (exception) {
        this.stop();
    }
});