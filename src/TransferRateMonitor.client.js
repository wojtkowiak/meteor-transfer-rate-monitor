class TransferRateMonitor extends TransferRateMonitorCommon {

    constructor() {
        super();
        this.currentTransferRateDependency = new Tracker.Dependency;
        this.currentServerTransferRateDependency = new Tracker.Dependency;
        this.currentServerTransferRate = {};
        this.protocol = new JsonProtocol();
        this.protocol.on('data', this.saveServerTransferRate.bind(this));
    }

    saveServerTransferRate(stats) {
        console.log(stats);
        this.currentServerTransferRate = stats;
        this.currentServerTransferRateDependency.changed();
    }

    getServerTransferRate() {
        this.currentServerTransferRateDependency.depend();
        return this.currentServerTransferRate;
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
        Meteor.subscribe('transferServer', 'giveMeStats');
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




