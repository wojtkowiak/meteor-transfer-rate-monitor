class TransferRateMonitor {

    constructor() {
        this.bytesIn = 0;
        this.bytesOut = 0;
        this.messagesIn = 0;
        this.messagesOut = 0;


        this.currentTransferRateDependency = new Tracker.Dependency;
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
            console.log('stringify', msg);
            const message = originalDDPCommonStringifyDDP(msg);
            self.bytesOut += message.length;
            return message;
        };
        if (Package['omega:direct-stream-access']) {
            const originalSend = Meteor.directStream.send;
            Meteor.directStream.send = function (message) {
                self.bytesOut += message.length;
                originalSend.call(Meteor.directStream, message);
            }
        }
    }

    messageHandler(message) {
        this.bytesIn += message.length;
        this.messagesIn++;
    }

    getTransferRate() {
        this.currentTransferRateDependency.depend();
        return this.currentTransferRate;
    }

    calculateCurrentTransferRate() {
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

        this.currentTransferRateDependency.changed();
    }

}

transferRateMonitor = new TransferRateMonitor();

transferRateWidget = {
    graphInElements: [],
    graphOutElements: [],
    historyIn: [],
    historyOut: [],
    widgetGraphWidth: 120,
    widgetHistory: 60,
    elementsCount: 0,
    updateGraph() {
        try {
            if (this.graphInElements.length === 0) return;
            let maxIn = Math.max(...this.historyIn);
            if (maxIn < 1024) maxIn = 1024;
            let maxOut = Math.max(...this.historyOut);
            if (maxOut < 1024) maxOut = 1024;

            this.historyIn.forEach((rateIn, id) => {
                this.graphInElements[id].style.height = Math.round(rateIn / maxIn * 30) + 'px';
            });
            this.historyOut.forEach((rateOut, id) => {
                this.graphOutElements[id].style.height = Math.round(rateOut / maxIn * 30) + 'px';
            });

        } catch (e) {
            console.log(e);
        }
    }
};

Template.transferRateClient.helpers({
    transferIn: () => {
        return transferRateMonitor.getTransferRate().rateIn;

        transferRateWidget.historyIn.unshift(transferRate.rateIn);
        transferRateWidget.historyOut.unshift(transferRate.rateOut);
        if (transferRateWidget.historyIn.length > transferRateWidget.elementsCount) {
            transferRateWidget.historyOut.pop();
            transferRateWidget.historyIn.pop();
        }
        transferRateWidget.updateGraph();

    },
    transferOut: () => {
        return transferRateMonitor.getTransferRate().rateOut;
    },
    kbs: bytes => {
        return Math.round((bytes / 1024) * 100) / 100;
    }
});

Template.valueMonitorWidget.helpers({})

Template.valueMonitorWidget.onRendered(function () {

    let graph = this.$('#graph');
    let elementsWidth = transferRateWidget.widgetGraphWidth / transferRateWidget.widgetHistory;
    transferRateWidget.elementsCount = transferRateWidget.widgetGraphWidth / elementsWidth;
    let element;
    let right = 4;
    for (let i = 0; i < transferRateWidget.elementsCount; i++) {
        element = document.createElement('div');
        element.style = `opacity:0.8;right:${right}px;bottom:4px;height:0px;width:${elementsWidth}px;background-color: #0f0;position:absolute;`;
        graph.append(element);
        right += elementsWidth;
        transferRateWidget.graphInElements.push(element);
    }
    right = 4;
    for (let i = 0; i < transferRateWidget.elementsCount; i++) {
        element = document.createElement('div');
        element.style = `opacity:0.8;right:${right}px;top:25px;height:0px;width:${elementsWidth}px;background-color: #f08;position:absolute;`;
        graph.append(element);
        right += elementsWidth;
        transferRateWidget.graphOutElements.push(element);
    }
});