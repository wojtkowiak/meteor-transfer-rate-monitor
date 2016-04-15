Package.describe({
    name: 'omega:transfer-rate-monitor',
    version: '1.0.0',
    summary: 'Provides transfer rate per second for the server and client.',
    git: '',
    documentation: 'README.md'
});

Package.onUse(function onUse(api) {
    api.versionsFrom('1.2.1');

    api.use('omega:monitor-widget@0.1.0');
    api.use('ecmascript@0.1.6');
    api.use(['ddp-common@1.2.2'], ['client', 'server']);
    api.use('tracker');
    api.use([
        'templating',
        'handlebars'
    ], 'client');

    api.use('omega:direct-stream-access', ['client', 'server']);
    api.use('omega:custom-protocol', ['client', 'server']);

    api.addFiles([
        'src/lib/TransferRateMonitor.js',
        'src/lib/TransferRate.protocol.js'
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
