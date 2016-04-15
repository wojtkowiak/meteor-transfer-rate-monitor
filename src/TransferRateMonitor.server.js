/**
 * API for the server.
 *
 * @type {TransferRateMonitor}
 */
class TransferRateMonitor extends TransferRateMonitorCommon {

    constructor() {
        super();
        this._callbacks = [];
        this._options = {
            maxSubscriptions: 10,
            allowedUsers: null,
            password: 'giveMeStats'
        };
        this._protocol = new TransferRateProtocol();
    }

    /**
     * Sets new options.
     * @param {Object} options - Object with options.
     */
    configure(options) {
        // TODO: validation
        _.extend(this._options, options);
    }

    /**
     * Getter for server transfer rate.
     * @returns {{rateIn: *, rateOut: *, messagesIn: *, messagesOut: *}|*}
     */
    getTransferRate() {
        return this._currentTransferRate;
    }

    /**
     * Calculates the rates per second and send the stats to all subscribed clients.
     *
     * @private
     */
    _calculateCurrentTransferRate() {
        this._calculateCurrentTransferRateCore();
        this._protocol.send(
            this._protocol.SERVER_TRANSFER_RATE_MESSAGE,
            Object.keys(this._currentTransferRate).map(key => this._currentTransferRate[key]),
            this._callbacks,
            true
        );
    }

    /**
     * Subscribes client for receiving serve stats.
     *
     * @param {string} id - Meteor session id.
     */
    registerConnection(id) {
        if (this._callbacks.length < this._options.maxSubscriptions) {
            this._callbacks.push(id);
        } else {
            throw new Error('Too many subscriptions.');
        }
    }

    /**
     * Unsubscribes client.
     * @param {string} id - Meteor session id.
     */
    unregisterConnection(id) {
        if (~this._callbacks.indexOf(id)) {
            this._callbacks.splice(this._callbacks.indexOf(id), 1);
        }
    }

    /**
     * Wraps direct stream's send method.
     * @private
     */
    _replaceDirectStreamAccessSend() {
        const originalSend = Meteor.directStream.send;
        Meteor.directStream.send = (message, sessionId) => {
            this.bytesOut += message.length;
            originalSend.call(Meteor.directStream, message, sessionId);
        };
    }

    /**
     * Checks if user is on the allowedUsers list.
     *
     * @param {string} password
     * @param {int} userId
     * @returns {boolean}
     */
    isUserAuthorized(password, userId) {
        if (this._options.password !== password) return false;
        if (this._options.allowedUsers === null) return true;
        return !!~this._options.allowedUsers.indexOf(userId);
    }
}

transferRateMonitor = new TransferRateMonitor();

/**
 * Publication that will gather session ids that are subscribed to stats from server.
 */
Meteor.publish('__serverTransferRate', function transferRate(password) {
    if (!transferRateMonitor.isUserAuthorized(password, this.userId)) {
        this.stop();
        return;
    }

    this.onStop(() => {
        transferRateMonitor.unregisterConnection(this.connection.id);
    });

    try {
        transferRateMonitor.registerConnection(this.connection.id);
    } catch (exception) {
        this.stop();
    }
});
