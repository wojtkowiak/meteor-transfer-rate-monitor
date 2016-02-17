class TransferRateMonitor extends TransferRateMonitorCommon {

    constructor() {
        super();
        this.currentTransferRateDependency = new Tracker.Dependency;
    }

    getTransferRate() {
        this.currentTransferRateDependency.depend();
        return this.currentTransferRate;
    }

    calculateCurrentTransferRate() {
        this.calculateCurrentTransferRateCore();
        this.currentTransferRateDependency.changed();
    }

    subscribe() {
        Meteor.subscribe('transferServer');
    }

    replaceDirectStreamAccessSend() {

        const originalSend = Meteor.directStream.send;
        Meteor.directStream.send = message => {
            this.bytesOut += message.length;
            originalSend.call(Meteor.directStream, message);
        }
    }
}

transferRateMonitor = new TransferRateMonitor();




