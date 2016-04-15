Template.transferRate.helpers({
    clientTransferIn: () => transferRateMonitor.getTransferRate().rateIn,
    clientTransferOut: () => transferRateMonitor.getTransferRate().rateOut,
    serverTransferIn: () => transferRateMonitor.getServerTransferRate().rateIn,
    serverTransferOut: () => transferRateMonitor.getServerTransferRate().rateOut,
    kbs: bytes => Math.round((bytes / 1024) * 100) / 100,
    eq: (arg1, arg2) => arg1 === arg2
});
