Template.transferRateForClient.helpers({
    transferIn: () => {
        return transferRateMonitor.getTransferRate().rateIn;
    },
    transferOut: () => {
        return transferRateMonitor.getTransferRate().rateOut;
    },
    kbs: bytes => {
        return Math.round((bytes / 1024) * 100) / 100;
    }
});
