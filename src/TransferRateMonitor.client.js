/**
 * API for the client.
 *
 * @type {TransferRateMonitor}
 */
class TransferRateMonitor extends TransferRateMonitorCommon {

    constructor() {
        super();
        this._currentTransferRateDependency = new Tracker.Dependency;
        this._currentServerTransferRateDependency = new Tracker.Dependency;
        this._currentServerTransferRate = {};
        this._protocol = new TransferRateProtocol();
        this._protocol.on(
            this._protocol.SERVER_TRANSFER_RATE_MESSAGE,
            this._saveServerTransferRate.bind(this)
        );
        this._subscription = null;
    }

    /**
     * Receives stats from the server.
     *
     * @param {Array} stats - Values packed into array.
     * @private
     */
    _saveServerTransferRate(stats) {
        this._currentServerTransferRate = {
            rateIn: stats[0],
            rateOut: stats[1],
            messagesIn: stats[2],
            messagesOut: stats[3]
        };
        this._currentServerTransferRateDependency.changed();
    }

    /**
     * Getter for server transfer rate.
     *
     * @returns {{rateIn: *, rateOut: *, messagesIn: *, messagesOut: *}|*}
     */
    getServerTransferRate() {
        this._currentServerTransferRateDependency.depend();
        return this._currentServerTransferRate;
    }

    /**
     * Getter for client transfer rate.
     *
     * @returns {{rateIn: *, rateOut: *, messagesIn: *, messagesOut: *}|*}
     */
    getTransferRate() {
        this._currentTransferRateDependency.depend();
        return this._currentTransferRate;
    }

    /**
     * Calculates the rates per second.
     * @private
     */
    _calculateCurrentTransferRate() {
        this._calculateCurrentTransferRateCore();
        this._currentTransferRateDependency.changed();
    }

    /**
     * Subscribes for receiving server transfer rate.
     *
     * @param {string} password - Password for the subscription.
     */
    subscribeForServerTransferRate(password) {
        if (this._subscription === null) {
            this._subscription = Meteor.subscribe('__serverTransferRate', password);
        }
    }

    /**
     * Unsubscribes from receiving server transfer rate.
     */
    unsubscribeForServerTransferRate() {
        if (this._subscription === null) {
            this._subscription.stop();
        }
    }

    /**
     * Wraps direct stream's send method.
     * @private
     */
    _replaceDirectStreamAccessSend() {
        const originalSend = Meteor.directStream.send;
        Meteor.directStream.send = message => {
            this.bytesOut += message.length;
            originalSend.call(Meteor.directStream, message);
        };
    }
}

transferRateMonitor = new TransferRateMonitor();
