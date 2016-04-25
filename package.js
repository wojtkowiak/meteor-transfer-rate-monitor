Package.describe({
    name: 'omega:transfer-rate-monitor',
    version: '1.0.6',
    summary: 'Provides transfer rate per second for the server and client.',
    git: 'https://github.com/wojtkowiak/meteor-transfer-rate-monitor',
    documentation: 'README.md'
});

Package.onUse(function onUse(api) {
    api.versionsFrom('METEOR@1.2');

    api.use('omega:monitor-widget@0.1.3');
    api.use('ecmascript');
    api.use(['ddp-common'], ['client', 'server']);
    api.use('tracker');
    api.use([
        'templating',
        'handlebars'
    ], 'client');

    api.use('omega:direct-stream-access@3.0.2', ['client', 'server']);
    api.use('omega:custom-protocol@3.0.1', ['client', 'server']);

    api.imply('omega:custom-protocol', ['client', 'server']);

    api.addFiles([
        'src/lib/TransferRateMonitor.js',
        'src/lib/TransferRate.protocol.js',
        'src/lib/TransferRate.protocol'
    ], ['client', 'server']);

    api.addFiles([
        'src/TransferRateMonitor.client.js',
        'src/templates/transferRate.html',
        'src/templates/transferRate.js'
    ], 'client');

    api.addFiles([
        'src/TransferRateMonitor.server.js'
    ], 'server');

    api.export('transferRateMonitor');
});
