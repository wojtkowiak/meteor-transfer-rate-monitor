Package.describe({
    name: 'omega:transfer-rate-monitor',
    version: '0.0.1',
    // Brief, one-line summary of the package.
    summary: '',
    // URL to the Git repository containing the source code for this package.
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function(api) {
    api.versionsFrom('1.2.1');
    api.use('ecmascript@0.1.6');
    api.use(['ddp-common@1.2.2'], 'client');
    api.use('tracker');
    api.use([
        'templating',
        'handlebars'
    ], 'client');
    api.use('omega:direct-stream-access', ['client', 'server'], { weak: true });
    api.addFiles([
        'src/transferRate.html',
        'src/transfer-rate.js',
    ], 'client');


    api.export('transferRateMonitor');
});

Package.onTest(function(api) {
    api.use('ecmascript');
    api.use('tinytest');
    api.use('omega:transfer-rate-monitor');
    api.addFiles('transfer-rate.tests.js');
});
