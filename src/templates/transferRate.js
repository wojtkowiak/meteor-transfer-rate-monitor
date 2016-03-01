Template.transferRate.helpers({
    clientTransferIn: () => {
        return transferRateMonitor.getTransferRate().rateIn;
    },
    clientTransferOut: () => {
        return transferRateMonitor.getTransferRate().rateOut;
    },
    serverTransferIn: () => {
        return transferRateMonitor.getServerTransferRate().rateIn;
    },
    serverTransferOut: () => {
        return transferRateMonitor.getServerTransferRate().rateOut;
    },
    kbs: bytes => {
        return Math.round((bytes / 1024) * 100) / 100;
    },
    eq: (arg1, arg2) => arg1 === arg2
});
